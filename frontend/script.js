// ==========================================
// SkillForge AI - Main Frontend Script
// ==========================================

const API_URL = "http://localhost:5000";

// ---------- Shared Helpers ----------

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("skillforgeUser") || "null");
    } catch (error) {
        console.error("Could not read saved user:", error);
        return null;
    }
}

function getAuthHeaders(includeJson = false) {
    const headers = {};
    const token = localStorage.getItem("skillforgeToken");

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

async function readResponse(response) {
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Server returned an invalid response.");
    }

    if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed (${response.status}).`);
    }

    return data;
}

// ---------- Dashboard Statistics ----------

function updateDashboardStats() {
    const skillRows = document.querySelectorAll(
        "#skillList .skill-row .skill-info strong"
    );

    const skillsAddedStat = document.getElementById("skillsAddedStat");
    const profileSkillCount = document.getElementById("profileSkillCount");

    if (skillsAddedStat) {
        skillsAddedStat.textContent = skillRows.length;
    }

    if (profileSkillCount) {
        profileSkillCount.textContent = skillRows.length;
    }

    // Do not calculate Skill Match from unrelated text.
    // dashboard.js updates it using the real API response.

    const roadmapButtons = [
        ...document.querySelectorAll(".roadmap-start-btn")
    ];

    const progressStat = document.getElementById("learningProgressStat");
    const roadmapProgress = document.getElementById("roadmapProgress");

    if (roadmapButtons.length > 0) {
        const completed = roadmapButtons.filter(
            button => button.disabled
        ).length;

        const percentage = Math.round(
            (completed / roadmapButtons.length) * 100
        );

        if (progressStat) {
            progressStat.textContent = `${percentage}%`;
        }

        if (roadmapProgress) {
            roadmapProgress.textContent = `${percentage}%`;
        }
    }
}

// ---------- Load Skills from MongoDB ----------

async function loadSkillsFromDatabase() {
    const user = getSavedUser();
    const skillList = document.getElementById("skillList");

    if (!user || !user.id || !skillList) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/users/${encodeURIComponent(user.id)}/skills`,
            {
                headers: getAuthHeaders()
            }
        );

        const data = await readResponse(response);

        // Avoid replacing dashboard.js skill management.
        // Only refresh if the server returned a skills array.
        if (!Array.isArray(data.skills)) {
            console.warn("Skills response did not contain a skills array.");
            return;
        }

        // This function only updates rows when dashboard.js has not
        // already registered its own skill manager.
        if (typeof window.runSkillAnalysis === "function") {
            console.log("Skill loading/management is handled by dashboard.js.");
            return;
        }

        skillList.querySelectorAll(".skill-row").forEach(row => row.remove());

        data.skills.forEach(skill => {
            const row = document.createElement("div");
            row.className = "skill-row";

            const info = document.createElement("div");
            info.className = "skill-info";

            const name = document.createElement("strong");
            name.textContent = String(skill);

            const level = document.createElement("span");
            level.textContent = "Beginner";

            info.append(name, level);

            const progress = document.createElement("div");
            progress.className = "progress";

            const bar = document.createElement("div");
            bar.style.width = "30%";
            progress.appendChild(bar);

            const percent = document.createElement("b");
            percent.textContent = "30%";

            row.append(info, progress, percent);
            skillList.appendChild(row);
        });

        updateDashboardStats();

        console.log("Skills loaded from MongoDB:", data.skills);
    } catch (error) {
        console.error("Load skills error:", error);
    }
}

// ---------- AI Career Assistant ----------

function setupAIAssistant() {
    const input = document.getElementById("aiQuestion");
    const button = document.getElementById("askAIButton");
    const chatBox = document.getElementById("aiChatBox");

    if (!input || !button || !chatBox) {
        return;
    }

    // Prevent duplicate click handlers if this script is initialized again.
    if (button.dataset.aiHandlerAttached === "true") {
        return;
    }

    button.dataset.aiHandlerAttached = "true";

    async function askAI() {
        const question = input.value.trim();

        if (!question) {
            return;
        }

        const user = getSavedUser() || {};
        const careerGoal = user.careerGoal || "Career goal not specified";

        const skills = [
            ...document.querySelectorAll(".skill-row .skill-info strong")
        ].map(element => element.textContent.trim());

        const userMessage = document.createElement("div");
        userMessage.className = "ai-message";
        userMessage.textContent = `You: ${question}`;
        chatBox.appendChild(userMessage);

        input.value = "";
        button.disabled = true;

        const thinkingMessage = document.createElement("div");
        thinkingMessage.className = "ai-message";
        thinkingMessage.textContent = "🤖 SkillForge AI is thinking...";
        chatBox.appendChild(thinkingMessage);

        try {
            const response = await fetch(`${API_URL}/api/ai-assistant`, {
                method: "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify({
                    question,
                    careerGoal,
                    skills
                })
            });

            const data = await readResponse(response);

            // textContent safely displays the returned answer as plain text.
            thinkingMessage.textContent = data.answer
                ? `🤖 ${data.answer}`
                : "🤖 No answer was returned.";
        } catch (error) {
            console.error("AI Assistant error:", error);
            thinkingMessage.textContent =
                `❌ ${error.message || "Could not connect to SkillForge AI backend."}`;
        } finally {
            button.disabled = false;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    button.addEventListener("click", askAI);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            askAI();
        }
    });
}

// ---------- Initialize ----------

document.addEventListener("DOMContentLoaded", () => {
    setupAIAssistant();
    updateDashboardStats();

    // dashboard.js owns Skill Match and the Add/Delete skill actions.
    // Do not attach another set of skill event listeners here.
    if (typeof window.runSkillAnalysis !== "function") {
        loadSkillsFromDatabase();
    }

    // Refresh counts when roadmap buttons change.
    document.addEventListener("click", event => {
        if (event.target.closest(".roadmap-start-btn")) {
            setTimeout(updateDashboardStats, 100);
        }
    });

    console.log("SkillForge AI main script initialized.");
});

// ---------- Login Form Handler ----------

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const button = loginForm.querySelector('button[type="submit"]');

        button.disabled = true;
        button.textContent = "Logging in...";

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await readResponse(response);

            const token = data.token || data.accessToken;
            const user = data.user;

            if (!token || !user) {
                throw new Error("Login response is missing user or token.");
            }

            localStorage.setItem("skillforgeToken", token);
            localStorage.setItem("skillforgeUser", JSON.stringify(user));

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "Login failed. Please try again.");
        } finally {
            button.disabled = false;
            button.textContent = "Login →";
        }
    });
});

/* ========== GOOGLE SIGN-IN CALLBACK ========== */

window.handleGoogleCredential = async function (googleResponse) {
    const message = document.getElementById("googleLoginMessage");
    const buttonContainer = document.getElementById("googleSignInButton");

    try {
        if (message) {
            message.textContent = "Verifying your Google account...";
        }

        if (!googleResponse || !googleResponse.credential) {
            throw new Error("Google did not return a valid credential.");
        }

        const response = await fetch(`${API_URL}/api/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                credential: googleResponse.credential
            })
        });

        const data = await readResponse(response);

        if (!data.token || !data.user) {
            throw new Error("Google login response is incomplete.");
        }

        localStorage.setItem("skillforgeToken", data.token);
        localStorage.setItem("skillforgeUser", JSON.stringify(data.user));

        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google login error:", error);

        if (message) {
            message.textContent =
                error.message || "Google sign-in failed. Please try again.";
        } else {
            alert(error.message || "Google sign-in failed.");
        }
    }
};
