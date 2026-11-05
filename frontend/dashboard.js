// SkillForge AI - AI Career Assistant

// SkillForge AI - AI Career Assistant

function initAIAssistant() {
    console.log("AI Assistant DOM handler running");

    const input = document.getElementById("aiQuestion");
    const button = document.getElementById("askAIButton");
    const chatBox = document.getElementById("aiChatBox");

    if (!input || !button || !chatBox) {
        console.log("AI Assistant elements not found");
        return;
    }

    // Prevent duplicate event listeners
    if (button.dataset.aiInitialized === "true") {
        return;
    }
    button.dataset.aiInitialized = "true";

    let isAsking = false;

    button.addEventListener("click", async () => {
        if (isAsking) return;

        const question = input.value.trim();
        if (!question) return;

        const token = localStorage.getItem("skillforgeToken");

        if (!token) {
            alert("Please login again to use SkillForge AI.");
            return;
        }

        let user = {};

        try {
            user = JSON.parse(
                localStorage.getItem("skillforgeUser") || "{}"
            );
        } catch (error) {
            console.error("User data parsing error:", error);
        }

        const careerGoal =
            user.careerGoal || "Career goal not specified";

        const skills = [
            ...document.querySelectorAll(
                ".skill-row .skill-info strong"
            )
        ].map(skill => skill.textContent.trim());

        const userMessage = document.createElement("div");
        userMessage.className = "ai-message";
        userMessage.textContent = "You: " + question;
        chatBox.appendChild(userMessage);

        const thinkingMessage = document.createElement("div");
        thinkingMessage.className = "ai-message";
        thinkingMessage.textContent =
            "🤖 SkillForge AI is thinking...";
        chatBox.appendChild(thinkingMessage);

        input.value = "";
        isAsking = true;
        button.disabled = true;
        button.textContent = "Thinking...";

        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            console.log("[Career AI] Sending question to backend");

            const response = await fetch(
                "https://skillforge-api-45.onrender.com/api/ai-assistant",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        question,
                        careerGoal,
                        skills
                    })
                }
            );

            const data = await response.json();

            console.log("[Career AI] Frontend received:", data);

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "AI request failed."
                );
            }

            if (
                typeof data.answer !== "string" ||
                !data.answer.trim()
            ) {
                throw new Error("AI returned an empty answer.");
            }

            thinkingMessage.textContent =
                "🤖 " + data.answer;

        } catch (error) {
            console.error("[Career AI] Frontend error:", error);

            thinkingMessage.textContent =
                "❌ " + error.message;

        } finally {
            isAsking = false;
            button.disabled = false;
            button.textContent = "Ask AI";
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initAIAssistant
    );
} else {
    initAIAssistant();
}

// ================= LIVE SKILL GAP ANALYZER =================
window.runSkillAnalysis = null;

const analyzeButton = document.getElementById("analyzeSkillsBtn");

if (analyzeButton) {

    const runSkillAnalysis = async () => {
        const savedUser = localStorage.getItem("skillforgeUser");
        const user = savedUser ? JSON.parse(savedUser) : {};

        const careerGoal = user.careerGoal || "Web Developer";

        const skills = [
            ...document.querySelectorAll(
                ".skill-row .skill-info strong"
            )
        ].map(skill => skill.textContent.trim());
        console.log("Skills sent for analysis:", skills);

        analyzeButton.textContent = "Analyzing...";

        try {

            const response = await fetch(
                "https://skillforge-api-45.onrender.com/api/analyze-skills",
                {
                    method: "POST",

                  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("skillforgeToken") || ""}`
},

                    body: JSON.stringify({
                        skills: skills,
                        careerGoal: careerGoal
                    })
                }
            );

            const data = await response.json();
            console.log("Skill analysis response:", data);

            if (!data.success) {
                throw new Error(data.message);
            }

            let resultBox =
                document.getElementById("skillAnalysisResult");

            if (!resultBox) {

                resultBox = document.createElement("div");

                resultBox.id = "skillAnalysisResult";

                analyzeButton.parentElement.appendChild(resultBox);
            }

            resultBox.innerHTML = `
    <div class="skill-analysis-result">

        <div class="analysis-header">
            <span>🎯</span>
            <div>
                <h3>Skill Match</h3>
                <strong>${data.matchPercentage}%</strong>
            </div>
        </div>

        <div class="analysis-section matched-section">
            <div class="analysis-title">
                <span>✅</span>
                <strong>Matched Skills</strong>
            </div>

            <div class="skill-tags">
                ${
                    data.matchedSkills.length
                    ? data.matchedSkills.map(skill =>
                        `<span class="skill-tag matched">${skill}</span>`
                    ).join("")
                    : `<span class="empty-skill">No matched skills yet</span>`
                }
            </div>
        </div>

        <div class="analysis-section learning-section">
            <div class="analysis-title">
                <span>🚀</span>
                <strong>Skills to Learn</strong>
            </div>

            <div class="skill-tags">
                ${
                    data.missingSkills.length
                    ? data.missingSkills.map(skill =>
                        `<span class="skill-tag learning">${skill}</span>`
                    ).join("")
                    : `<span class="empty-skill">No major skill gaps 🎉</span>`
                }
            </div>
        </div>

    </div>
`;
const gapScore = document.getElementById("gapScore");
const gapList = document.getElementById("gapList");
const gapDescription = document.getElementById("gapDescription");

if (gapScore) {
    gapScore.textContent =
        data.matchPercentage >= 80
            ? "Strong Match"
            : data.matchPercentage >= 60
                ? "Good Progress"
                : "Needs Work";
}

const matchStat = document.getElementById("skillMatchStat");
const profileMatch = document.getElementById("profileMatch");

if (matchStat) {
    matchStat.textContent = `${data.matchPercentage}%`;
}

if (profileMatch) {
    profileMatch.textContent = `${data.matchPercentage}%`;
}


if (gapDescription) {
    gapDescription.textContent =
        `Based on your ${data.careerGoal} career goal, these skills can improve your profile.`;
}

if (gapList) {

    if (data.missingSkills.length === 0) {

        gapList.innerHTML = `
            <div class="gap-item">
                <span>🎉 No major skill gaps</span>
                <b>Great</b>
            </div>
        `;

    } else {

        gapList.innerHTML = data.missingSkills
            .map((skill, index) => `
                <div class="gap-item">
                    <span>📚 ${skill}</span>
                    <b>${index === 0 ? "High Priority" : "Recommended"}</b>
                </div>
            `)
            .join("");
    }
}
            analyzeButton.textContent = "Analyze Again →";

           window.currentMissingSkills = data.missingSkills;
window.currentCareerGoal = data.careerGoal;
generatePersonalizedRoadmap(data.missingSkills, data.careerGoal);
        } catch (error) {

            console.error(error);

            analyzeButton.textContent = "Analyze My Skills →";

            alert("Could not connect to SkillForge AI backend.");
        }
    };

    window.runSkillAnalysis = runSkillAnalysis;
    console.log("Automatic skill analysis function registered");

    analyzeButton.addEventListener("click", runSkillAnalysis);
}

// ================= PERSONALIZED ROADMAP =================


async function generatePersonalizedRoadmap(missingSkills, careerGoal) {

    try {

        const response = await fetch(
            "https://skillforge-api-45.onrender.com/api/learning-roadmap",
            {
                method: "POST",

             headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("skillforgeToken") || ""}`
},
                body: JSON.stringify({
                    missingSkills: missingSkills,
                    careerGoal: careerGoal
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        let roadmapBox =
            document.getElementById("personalizedRoadmap");

        if (!roadmapBox) {

            roadmapBox = document.createElement("div");

            roadmapBox.id = "personalizedRoadmap";

            analyzeButton.parentElement.appendChild(roadmapBox);
        }

        roadmapBox.innerHTML = `
            <div style="margin-top:20px;">
                <h3>🚀 Your Personalized Roadmap</h3>

                ${data.roadmap.map(item => `
                    <div style="margin:12px 0;">
                     <div>
   <strong>
    ${item.step}. ${item.skill}
</strong>

<p>
    ${item.status} • ${item.duration}
</p>

<button
    class="roadmap-start-btn"
    data-skill="${item.skill}"
>
    Start Learning →
</button>
</div>
                    </div>
                `).join("")}

            </div>
        `;

    } catch (error) {

        console.error("Roadmap error:", error);

    }

}
// ================= ROADMAP PROGRESS TRACKING =================
// ================= ROADMAP PROGRESS - MONGODB =================

const ROADMAP_API_URL = "https://skillforge-api-45.onrender.com";

function getRoadmapUser() {
    try {
        return JSON.parse(
            localStorage.getItem("skillforgeUser") || "null"
        );
    } catch {
        return null;
    }
}

// ================= UPDATE PROGRESS PERCENTAGE =================

function updateRoadmapProgress() {
    const buttons = [
        ...document.querySelectorAll(".roadmap-start-btn")
    ];

    const progressElement =
        document.getElementById("roadmapProgress");

    const progressStat =
        document.getElementById("learningProgressStat");

    if (!buttons.length) {
        if (progressElement) progressElement.textContent = "0%";
        if (progressStat) progressStat.textContent = "0%";
        return;
    }

    const completed = buttons.filter(
        button => button.disabled
    ).length;

    const percentage = Math.round(
        (completed / buttons.length) * 100
    );

    if (progressElement) {
        progressElement.textContent = percentage + "%";
    }

    if (progressStat) {
        progressStat.textContent = percentage + "%";
    }
}

// ================= LOAD PROGRESS FROM MONGODB =================

async function loadRoadmapProgressFromDatabase() {
    const user = getRoadmapUser();
    const token = localStorage.getItem("skillforgeToken");

    if (!user?.id || !token) {
        console.warn("Login required to load learning progress.");
        return;
    }

    try {
        const response = await fetch(
            `${ROADMAP_API_URL}/api/users/${encodeURIComponent(user.id)}/learning-progress`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Could not load learning progress."
            );
        }

        const savedProgress = data.learningProgress || [];
        const completedSkills = new Set(
    savedProgress
        .filter(item => item.status === "completed")
        .map(item => (item.skill || "").trim().toLowerCase())
);

document.querySelectorAll(".roadmap-start-btn").forEach(button => {
    const skill = (button.dataset.skill || "").trim().toLowerCase();
    const isCompleted = completedSkills.has(skill);

    button.textContent = isCompleted
        ? "Completed ✓"
        : "Start Learning →";

    button.disabled = isCompleted;
    button.style.opacity = isCompleted ? "0.6" : "1";
});

        updateRoadmapProgress();

        console.log("Learning progress loaded from MongoDB.");

    } catch (error) {
        console.error("Load learning progress error:", error);
    }
}

// ================= SAVE PROGRESS TO MONGODB =================

document.addEventListener("click", async event => {
    const button = event.target.closest(".roadmap-start-btn");

    if (!button || button.disabled) {
        return;
    }

    const user = getRoadmapUser();
    const token = localStorage.getItem("skillforgeToken");
    const skill = (button.dataset.skill || "").trim();
// Open the lesson page instead of marking it completed
const lessonUrl =
    `lesson.html?skill=${encodeURIComponent(skill)}`;

window.location.href = lessonUrl;
return;
    if (!user?.id || !token) {
        alert("Please log in again to save learning progress.");
        return;
    }

    if (!skill) {
        alert("Skill name is missing from this roadmap item.");
        return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Saving...";
    button.style.opacity = "0.7";

    try {
        const response = await fetch(
            `${ROADMAP_API_URL}/api/users/${encodeURIComponent(user.id)}/learning-progress`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    skill: skill,
                    status: "completed",
                    progress: 100
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Could not save learning progress."
            );
        }

        button.textContent = "Completed ✓";
        button.style.opacity = "0.6";

        updateRoadmapProgress();

        console.log(`${skill} progress saved to MongoDB.`);

    } catch (error) {
        console.error("Save learning progress error:", error);

        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = "1";

        alert(
            error.message ||
            "Could not save progress. Please try again."
        );
    }
});

// ================= INITIAL PROGRESS LOAD =================

document.addEventListener("DOMContentLoaded", () => {
    loadRoadmapProgressFromDatabase();
    updateRoadmapProgress();
});

/* ================= CAREER PROFILE ================= */

async function loadCareerProfile() {
    const profileBox = (() => {
        let box = document.getElementById("careerProfileCard");

        if (!box) {
            box = document.createElement("section");
            box.id = "careerProfileCard";
            box.className = "career-profile-card";

            const footer = document.querySelector(".dashboard-footer");

            if (footer) {
                footer.before(box);
            } else {
                document.querySelector("main")?.appendChild(box);
            }
        }

        return box;
    })();

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    try {
        const savedUser = localStorage.getItem("skillforgeUser");
        const user = savedUser ? JSON.parse(savedUser) : {};
        const token = localStorage.getItem("skillforgeToken");

        const careerGoal = user.careerGoal || "Web Developer";

        // Read currently loaded skills from the dashboard.
        const skills = [
            ...document.querySelectorAll(
                "#skillList .skill-row .skill-info strong"
            )
        ]
            .map((element) => element.textContent.trim())
            .filter(Boolean);

        profileBox.innerHTML = `
            <div class="career-profile-inner">
                <div class="career-profile-heading">
                    <div class="career-profile-icon">🎯</div>
                    <div>
                        <p class="career-profile-eyebrow">YOUR CAREER JOURNEY</p>
                        <h2>Career Profile</h2>
                        <p class="career-profile-subtitle">
                            Track your skills and career readiness.
                        </p>
                    </div>
                </div>
                <p class="career-profile-loading">Updating your career profile...</p>
            </div>
        `;

        const headers = {
            "Content-Type": "application/json"
        };

        // Send the token when available.
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
            "https://skillforge-api-45.onrender.com/api/career-profile",
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    careerGoal,
                    skills
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.profile) {
            throw new Error(
                result.message || "Unable to load career profile."
            );
        }

        const profile = result.profile;
        const matchedSkills = Array.isArray(profile.matchedSkills)
            ? profile.matchedSkills
            : [];
        const missingSkills = Array.isArray(profile.missingSkills)
            ? profile.missingSkills
            : [];

        const matchPercentage = Math.max(
            0,
            Math.min(100, Number(profile.matchPercentage) || 0)
        );

        profileBox.innerHTML = `
            <div class="career-profile-inner">
                <div class="career-profile-heading">
                    <div class="career-profile-icon">🎯</div>
                    <div>
                        <p class="career-profile-eyebrow">YOUR CAREER JOURNEY</p>
                        <h2>Career Profile</h2>
                        <p class="career-profile-subtitle">
                            Your skills, your goal, your next step.
                        </p>
                    </div>
                </div>

                <div class="career-profile-goal">
                    <span class="career-profile-goal-icon">🚀</span>
                    <div>
                        <span class="career-profile-label">CAREER GOAL</span>
                        <h3>${escapeHTML(profile.careerGoal || careerGoal)}</h3>
                    </div>
                </div>

                <div class="career-profile-stats">
                    <div class="career-profile-stat">
                        <span class="career-profile-stat-icon">💻</span>
                        <span class="career-profile-label">TOTAL SKILLS</span>
                        <strong>${Number(profile.totalSkills) || skills.length}</strong>
                    </div>

                    <div class="career-profile-stat">
                        <span class="career-profile-stat-icon">📊</span>
                        <span class="career-profile-label">CAREER MATCH</span>
                        <strong>${matchPercentage}%</strong>
                    </div>
                </div>

                <div class="career-match-track">
                    <div
                        class="career-match-fill"
                        style="width: ${matchPercentage}%"
                    ></div>
                </div>

                <div class="career-profile-section">
                    <h3>✅ Matched Skills</h3>
                    <div class="career-profile-tags">
                        ${
                            matchedSkills.length
                                ? matchedSkills.map(skill =>
                                    `<span class="career-skill-tag matched">${escapeHTML(skill)}</span>`
                                ).join("")
                                : `<span class="career-profile-empty">None yet — keep building your skills.</span>`
                        }
                    </div>
                </div>

                <div class="career-profile-section">
                    <h3>📚 Skills to Learn</h3>
                    <div class="career-profile-tags">
                        ${
                            missingSkills.length
                                ? missingSkills.map(skill =>
                                    `<span class="career-skill-tag learning">${escapeHTML(skill)}</span>`
                                ).join("")
                                : `<span class="career-profile-empty">No major skill gaps 🎉</span>`
                        }
                    </div>
                </div>

                <p class="career-profile-note">
                    Keep adding your skills and analyze them to track your progress.
                </p>
            </div>
        `;

    } catch (error) {
        console.error("Career Profile Error:", error);

        profileBox.innerHTML = `
            <div class="career-profile-inner">
                <h2>🎯 Career Profile</h2>
                <p class="career-profile-error">
                    Career Profile could not be loaded.
                    Please check that the backend is running and try again.
                </p>
                <button
                    type="button"
                    class="career-profile-retry"
                    id="retryCareerProfileBtn"
                >
                    Try Again ↻
                </button>
            </div>
        `;

        document.getElementById("retryCareerProfileBtn")
            ?.addEventListener("click", loadCareerProfile);
    }
}

/* Load Career Profile when dashboard opens */
document.addEventListener("DOMContentLoaded", () => {
    loadCareerProfile();
});

/* Allow other dashboard features to refresh the profile */
window.refreshCareerProfile = loadCareerProfile;

// ================= GENERATE ROADMAP BUTTON =================

document.addEventListener("DOMContentLoaded", () => {

    const generateRoadmapBtn =
        document.getElementById("generateRoadmapBtn");

    if (!generateRoadmapBtn) return;

    generateRoadmapBtn.onclick = async () => {

        if (!window.currentMissingSkills) {
            alert("Please click Analyze My Skills first.");
            return;
        }

        console.log("Generate Roadmap clicked");

        generateRoadmapBtn.textContent = "Generating...";
        generateRoadmapBtn.disabled = true;

        try {
            await generatePersonalizedRoadmap(
                window.currentMissingSkills,
                window.currentCareerGoal
            );
            await loadRoadmapProgressFromDatabase();
            

            const roadmap =
                document.getElementById("personalizedRoadmap");

            if (roadmap) {
                roadmap.style.display = "block";
                roadmap.style.visibility = "visible";
                roadmap.style.opacity = "1";

                roadmap.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        } catch (error) {
            console.error("Roadmap generation error:", error);
            alert("Unable to generate roadmap.");
        }

        generateRoadmapBtn.textContent = "Generate My Roadmap →";
        generateRoadmapBtn.disabled = false;
    };

});
// ================= REAL MONGODB SKILL FEATURE =================

document.addEventListener("DOMContentLoaded", () => {

    const addSkillBtn = document.getElementById("addSkillBtn");
    const skillList = document.getElementById("skillList");

    if (!addSkillBtn || !skillList) {
        console.log("Add Skill elements not found");
        return;
    }

    const API_URL = "https://skillforge-api-45.onrender.com";

    const savedUser = localStorage.getItem("skillforgeUser");

    if (!savedUser) {
        console.log("No logged-in user found.");
        return;
    }
const user = JSON.parse(savedUser);
const userId = user.id;

console.log("Logged-in user:", user);
console.log("User ID:", userId);
    console.log("Logged-in user:", user);
console.log("User ID:", userId);

    if (!userId) {
        console.log("User ID not found.");
        return;
    }


    // ================= LOAD SKILLS FROM MONGODB =================

    async function loadSkillsFromDatabase() {

        try {
const token = localStorage.getItem("skillforgeToken");

const response = await fetch(
    `${API_URL}/api/users/${userId}/skills`,
    {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
);

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            skillList
                .querySelectorAll(".skill-row")
                .forEach(row => row.remove());

            
data.skills.forEach(skill => {
    createSkillRow(skill);
});

updateSkillCount();

console.log("Skills loaded from MongoDB:", data.skills);

// Refresh Career Profile after skills are loaded
if (typeof window.refreshCareerProfile === "function") {
    await window.refreshCareerProfile();
}


        } catch (error) {

            console.error(
                "Load skills error:",
                error
            );

        }
    }


    // ================= CREATE SKILL ROW =================

    function createSkillRow(skillName) {

        const skillRow =
            document.createElement("div");

        skillRow.className = "skill-row";

        skillRow.innerHTML = `
            <div class="skill-info">
                <strong>${skillName}</strong>
                <span>Beginner</span>
            </div>

            <div class="progress">
                <div style="width:30%"></div>
            </div>

            <b>30%</b>

            <button
                class="delete-skill-btn"
                data-skill="${encodeURIComponent(skillName)}"
                style="
                    margin-left:10px;
                    padding:7px 12px;
                    border:none;
                    border-radius:7px;
                    cursor:pointer;
                "
            >
                Delete
            </button>
        `;

        skillList.insertBefore(
            skillRow,
            document.getElementById("addSkillForm")
        );
    }


    // ================= DELETE SKILL =================

    skillList.addEventListener("click", async (event) => {

        if (!event.target.classList.contains("delete-skill-btn")) {
            return;
        }

        const button = event.target;

        const skillName =
            decodeURIComponent(button.dataset.skill);

        const confirmDelete =
            confirm(`Remove ${skillName} from your skills?`);

        if (!confirmDelete) {
            return;
        }

        button.textContent = "Deleting...";
        button.disabled = true;

        try {
const token = localStorage.getItem("skillforgeToken");

const response = await fetch(
    `${API_URL}/api/users/${userId}/skills/${encodeURIComponent(skillName)}`,
    {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
);

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }
await loadSkillsFromDatabase();

console.log("Deleted skill. Running automatic analysis...");
console.log("Analysis function:", typeof window.runSkillAnalysis);

if (typeof window.runSkillAnalysis === "function") {
    await window.runSkillAnalysis();
} else {
    console.error("Skill analysis function is not available!");
}
alert(`${skillName} removed successfully.`);
        } catch (error) {

            console.error(
                "Delete skill error:",
                error
            );

            alert(
                error.message ||
                "Could not delete skill."
            );

            button.textContent = "Delete";
            button.disabled = false;
        }

    });


    // ================= ADD SKILL BUTTON =================

    addSkillBtn.addEventListener("click", () => {

        if (document.getElementById("addSkillForm")) {
            return;
        }

        const form =
            document.createElement("div");

        form.id = "addSkillForm";

        form.style.cssText = `
            margin-top:18px;
            padding:18px;
            border-radius:14px;
            background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.12);
        `;

      
form.innerHTML = `
    <h3 style="margin-bottom:12px;">➕ Add New Skill</h3>

    <input
        type="search"
        id="skillSearchInput"
        placeholder="🔍 Search skills... e.g. JavaScript, Python, Docker"
        autocomplete="off"
        style="
            width:100%;
            box-sizing:border-box;
            padding:13px;
            margin-bottom:12px;
            border-radius:10px;
            border:1px solid #514078;
            background:#171329;
            color:#ffffff;
            font-size:14px;
            outline:none;
        "
    >

   
<select
    id="newSkillName"
    size="7"
    aria-label="Available skills"
    style="
        display:block;
        width:100%;
        box-sizing:border-box;
        padding:12px;
        margin:0 0 16px;
        border-radius:14px;
        border:1px solid rgba(167,139,250,0.45);
        background:linear-gradient(145deg,#1c1730,#100d1d);
        color:#f5f3ff;
        font-size:14px;
        font-family:inherit;
        line-height:1.8;
        outline:none;
        box-shadow:0 8px 24px rgba(0,0,0,0.22);
        scrollbar-width:thin;
        scrollbar-color:#7656c9 #171329;
    "
>

    <option value="">Select a skill</option>
          

        <optgroup label="Programming Languages">
            <option value="C">C</option>
            <option value="C++">C++</option>
            <option value="C#">C#</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="PHP">PHP</option>
            <option value="Go">Go (Golang)</option>
            <option value="Rust">Rust</option>
            <option value="Kotlin">Kotlin</option>
            <option value="Swift">Swift</option>
            <option value="Ruby">Ruby</option>
            <option value="R">R Programming</option>
            <option value="Dart">Dart</option>
        </optgroup>

        <optgroup label="Web Development">
            <option value="HTML">HTML</option>
            <option value="CSS">CSS</option>
            <option value="Sass">Sass / SCSS</option>
            <option value="Tailwind CSS">Tailwind CSS</option>
            <option value="Bootstrap">Bootstrap</option>
            <option value="React.js">React.js</option>
            <option value="Next.js">Next.js</option>
            <option value="Angular">Angular</option>
            <option value="Vue.js">Vue.js</option>
            <option value="Node.js">Node.js</option>
            <option value="Express.js">Express.js</option>
            <option value="REST APIs">REST APIs</option>
            <option value="GraphQL">GraphQL</option>
            <option value="WebSockets">WebSockets</option>
        </optgroup>

        <optgroup label="Database">
            <option value="SQL">SQL</option>
            <option value="MySQL">MySQL</option>
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MongoDB">MongoDB</option>
            <option value="Redis">Redis</option>
            <option value="Firebase">Firebase</option>
        </optgroup>

        <optgroup label="AI / Machine Learning">
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Deep Learning">Deep Learning</option>
            <option value="Generative AI">Generative AI</option>
            <option value="Prompt Engineering">Prompt Engineering</option>
            <option value="Natural Language Processing">Natural Language Processing (NLP)</option>
            <option value="Computer Vision">Computer Vision</option>
            <option value="TensorFlow">TensorFlow</option>
            <option value="PyTorch">PyTorch</option>
            <option value="Pandas">Pandas</option>
            <option value="NumPy">NumPy</option>
        </optgroup>

        <optgroup label="Tools & DevOps">
            <option value="Git">Git</option>
            <option value="Git & GitHub">Git & GitHub</option>
            <option value="GitHub Actions">GitHub Actions</option>
            <option value="Linux">Linux</option>
            <option value="Docker">Docker</option>
            <option value="Kubernetes">Kubernetes</option>
            <option value="CI/CD">CI/CD</option>
            <option value="AWS">Amazon Web Services (AWS)</option>
            <option value="Microsoft Azure">Microsoft Azure</option>
            <option value="Google Cloud">Google Cloud Platform (GCP)</option>
            <option value="Postman">Postman</option>
            <option value="VS Code">Visual Studio Code</option>
        </optgroup>

        <optgroup label="Computer Science & Core">
            <option value="Data Structures and Algorithms">Data Structures and Algorithms (DSA)</option>
            <option value="Object-Oriented Programming">Object-Oriented Programming (OOP)</option>
            <option value="DBMS">Database Management Systems (DBMS)</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="System Design">System Design</option>
            <option value="Problem Solving">Problem Solving</option>
        </optgroup>

        <optgroup label="Cybersecurity">
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Network Security">Network Security</option>
            <option value="Ethical Hacking">Ethical Hacking</option>
            <option value="Penetration Testing">Penetration Testing</option>
        </optgroup>

        <optgroup label="Mobile & Other">
            <option value="Flutter">Flutter</option>
            <option value="Android Development">Android Development</option>
            <option value="React Native">React Native</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Figma">Figma</option>
            <option value="Excel">Microsoft Excel</option>
            <option value="Power BI">Power BI</option>
            <option value="Tableau">Tableau</option>
        </optgroup>
    </select>

    <label
        for="customSkillName"
        style="display:block;margin:4px 0 8px;color:#c9bddf;"
    >
        Or enter another skill
    </label>

    <input
        type="text"
        id="customSkillName"
        maxlength="80"
        placeholder="Enter a skill not listed above"
        autocomplete="off"
        style="
            width:100%;
            box-sizing:border-box;
            padding:12px;
            margin-bottom:14px;
            border-radius:10px;
            border:1px solid #514078;
            background:#171329;
            color:#ffffff;
            font-size:14px;
        "
    >

    <button
        id="saveSkillBtn"
        type="button"
        class="primary-dashboard-button"
    >
        Save Skill
    </button>

    <button
        id="cancelSkillBtn"
        type="button"
        style="
            margin-left:8px;
            padding:10px 16px;
            border-radius:8px;
            cursor:pointer;
        "
    >
        Cancel
    </button>
`;


const skillSearchInput = form.querySelector("#skillSearchInput");
const skillSelect = form.querySelector("#newSkillName");
const customSkillInput = form.querySelector("#customSkillName");
skillSearchInput.addEventListener("input", () => {
    const query = skillSearchInput.value.trim().toLowerCase();

    Array.from(skillSelect.querySelectorAll("optgroup")).forEach(group => {
        let visibleCount = 0;

        Array.from(group.options).forEach(option => {
            const matches = option.textContent.toLowerCase().includes(query);
            option.hidden = !matches;

            if (matches) visibleCount++;
        });

        group.hidden = visibleCount === 0;
    });

    skillSelect.selectedIndex = 0;
});

skillSelect.addEventListener("change", () => {
    if (skillSelect.value) {
        customSkillInput.value = "";
    }
});

customSkillInput.addEventListener("input", () => {
    if (customSkillInput.value.trim()) {
        skillSelect.value = "";
    }
});

        skillList.appendChild(form);

        document
            .getElementById("saveSkillBtn")
            .addEventListener(
                "click",
                saveSkillToDatabase
            );

        document
            .getElementById("cancelSkillBtn")
            .addEventListener(
                "click",
                () => form.remove()
            );

    });


    // ================= SAVE SKILL TO MONGODB =================

    async function saveSkillToDatabase() {

        const selectedSkill =
    document.getElementById("newSkillName").value;

const customSkill =
    document.getElementById("customSkillName").value.trim();

const skillName = customSkill || selectedSkill;

if (!skillName) {
    alert("Please select or enter a skill.");
    return;
}

if (skillName.length > 80) {
    alert("Skill name must be 80 characters or fewer.");
    return;
}
   
        const existingSkills = [
            ...document.querySelectorAll(
                ".skill-row .skill-info strong"
            )
        ].map(skill =>
            skill.textContent.trim().toLowerCase()
        );

        if (
            existingSkills.includes(
                skillName.toLowerCase()
            )
        ) {
            alert("This skill is already added.");
            return;
        }

        const saveButton =
            document.getElementById("saveSkillBtn");

        saveButton.textContent = "Saving...";
        saveButton.disabled = true;

        try {

            const response = await fetch(
                `${API_URL}/api/users/${userId}/skills`,
                {
                    method: "POST",
headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("skillforgeToken") || ""}`
},

                    body: JSON.stringify({
                        skill: skillName
                    })
                }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            document
                .getElementById("addSkillForm")
                .remove();
await loadSkillsFromDatabase();

if (window.runSkillAnalysis) {
    await window.runSkillAnalysis();
}

alert(
    `${skillName} added successfully! 🎉`
);

        } catch (error) {

            console.error(
                "Save skill error:",
                error
            );

            alert(
                error.message ||
                "Could not save skill to database."
            );

            saveButton.textContent = "Save Skill";
            saveButton.disabled = false;
        }
    }


    // ================= UPDATE SKILL COUNT =================

function updateSkillCount() {
    const count = document.querySelectorAll(
        "#skillList .skill-row .skill-info strong"
    ).length;

    const skillStat = document.getElementById("skillsAddedStat");
    if (skillStat) {
        skillStat.textContent = count;
    }

    const profileCount = document.getElementById("profileSkillCount");
    if (profileCount) {
        profileCount.textContent = count;
    }
}


function updateDashboardStats() {
    // Skill Match: show the latest AI analysis score
    const matchStat = document.getElementById("skillMatchStat");
    const profileMatch = document.getElementById("profileMatch");
    const gapScore = document.getElementById("gapScore");

    if (matchStat && gapScore) {
        const scoreText = gapScore.textContent.trim();
        const match = scoreText.match(/(\d+(?:\.\d+)?)\s*%/);

        if (match) {
            matchStat.textContent = `${match[1]}%`;

            if (profileMatch) {
                profileMatch.textContent = `${match[1]}%`;
            }
        }
    }

    // Learning Progress: completed roadmap buttons
    const progressStat = document.getElementById("learningProgressStat");
    const roadmapButtons = document.querySelectorAll(".roadmap-start-btn");

    if (progressStat && roadmapButtons.length > 0) {
        const completed = Array.from(roadmapButtons).filter(
            button => button.disabled
        ).length;

        const progress = Math.round(
            (completed / roadmapButtons.length) * 100
        );

        progressStat.textContent = `${progress}%`;
    }
}

    // Load skills from MongoDB
    loadSkillsFromDatabase();

});

// ================= PROFILE CARD =================

/* ================= MY PROFILE ================= */

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://skillforge-api-45.onrender.com";

    const getSavedUser = () => {
        try {
            return JSON.parse(localStorage.getItem("skillforgeUser") || "null");
        } catch {
            return null;
        }
    };

    function renderProfile(user) {
        const name = user.name || "Student";

        const elements = {
            profileCardName: name,
            profileCardGoal: user.careerGoal || "Career Goal",
            profileBranch: user.branch || "CSE",
            profileYear: user.year || "1st Year"
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

       const avatar = document.getElementById("profileAvatar");

if (avatar) {
    avatar.replaceChildren();

    const photoUrl = user.profilePhoto?.url;

    if (photoUrl) {
        const image = document.createElement("img");

        image.src = photoUrl;
        image.alt = "Profile photo";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.borderRadius = "inherit";

        avatar.appendChild(image);
    } else {
        avatar.textContent = name.charAt(0).toUpperCase();
    }
}
        
const socialLinks = document.getElementById("profileSocialLinks");

if (socialLinks) {
    socialLinks.replaceChildren();

    [
        { key: "githubUrl", label: "GitHub ↗" },
        { key: "linkedinUrl", label: "LinkedIn ↗" }
    ].forEach(({ key, label }) => {
        const url = user[key];

        if (url && /^https:\/\/(www\.)?/.test(url)) {
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = label;
            link.style.cssText =
                "color:#bba2ff;text-decoration:none;padding:8px 12px;" +
                "border:1px solid #514078;border-radius:8px;";
            socialLinks.appendChild(link);
        }
    });
}

    }
    function updateProfileSkillCount() {
        const skills = document.querySelectorAll(
            ".skill-row .skill-info strong"
        );

        const count = document.getElementById("profileSkillCount");
        if (count) count.textContent = skills.length;
    }

    function createProfileModal() {
        if (document.getElementById("profileEditModal")) return;

        const modal = document.createElement("div");
        modal.id = "profileEditModal";

        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(0,0,0,0.75);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="
                background:#19152b;
                color:white;
                width:100%;
                max-width:520px;
                padding:25px;
                border-radius:16px;
                border:1px solid #514078;
                margin:auto;
            ">
                <h2 style="margin-top:0">Edit My Profile</h2>
                <p style="color:#bcb5d0">
                    Update your details and save them to your account.
                </p>

                <form id="profileEditForm">
                    <label>Name</label>
                    <input name="name" required maxlength="100"
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">

                    <label>Email (read only)</label>
                    <input name="email" readonly
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">

                    <label>Career Goal</label>
                    <select name="careerGoal" required
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">
                        <option>Web Developer</option>
                        <option>Full Stack Developer</option>
                        <option>Software Developer</option>
                        <option>Data Analyst</option>
                        <option>AI Engineer</option>
                        <option>Cyber Security</option>
                    </select>

                    <label>Branch</label>
                    <input name="branch" required maxlength="50"
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">

                    <label>Year</label>
                    <select name="year"
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                    </select>

                    <label>Bio</label>
                    <textarea name="bio" maxlength="500" rows="3"
                        placeholder="Write a short introduction..."
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px"></textarea>

                    <label>GitHub URL</label>
                    <input name="githubUrl" type="url" placeholder="https://github.com/username"
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">

                    <label>LinkedIn URL</label>
                    <input name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/username"
                        style="width:100%;box-sizing:border-box;padding:11px;margin:7px 0 15px;border-radius:8px">

                    <p id="profileSaveMessage" role="status"></p>

                    <div style="display:flex;gap:10px;justify-content:flex-end">
                        <button type="button" id="cancelProfileEdit"
                            style="padding:10px 16px;border-radius:8px;cursor:pointer">
                            Cancel
                        </button>
                        <button type="submit" id="saveProfileBtn"
                            style="padding:10px 16px;border-radius:8px;background:#8b5cf6;color:white;border:0;cursor:pointer">
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector("#cancelProfileEdit").addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.addEventListener("click", event => {
            if (event.target === modal) modal.style.display = "none";
        });

        modal.querySelector("#profileEditForm").addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const user = getSavedUser();
                const token = localStorage.getItem("skillforgeToken");
                const message = modal.querySelector("#profileSaveMessage");
                const saveButton = modal.querySelector("#saveProfileBtn");

                if (!user?.id || !token) {
                    message.textContent = "Please log in again to save your profile.";
                    return;
                }

                const form = event.currentTarget;
                const data = new FormData(form);

                const profile = {
                    name: String(data.get("name") || "").trim(),
                    careerGoal: String(data.get("careerGoal") || "").trim(),
                    branch: String(data.get("branch") || "").trim(),
                    year: String(data.get("year") || "").trim(),
                    bio: String(data.get("bio") || "").trim(),
                    githubUrl: String(data.get("githubUrl") || "").trim(),
                    linkedinUrl: String(data.get("linkedinUrl") || "").trim()
                };

                for (const key of ["githubUrl", "linkedinUrl"]) {
                    if (profile[key] && !/^https:\/\/(www\.)?/.test(profile[key])) {
                        message.textContent = "Please use a valid HTTPS URL for GitHub and LinkedIn.";
                        return;
                    }
                }

                saveButton.disabled = true;
                message.textContent = "Saving profile...";

                try {
                    const response = await fetch(
                        `${API_URL}/api/users/${encodeURIComponent(user.id)}/profile`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify(profile)
                        }
                    );

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.message || "Could not save profile.");
                    }

                    const updatedUser = {
                        ...user,
                        ...result.profile,
                        id: user.id,
                        skills: user.skills || []
                    };

                    localStorage.setItem(
                        "skillforgeUser",
                        JSON.stringify(updatedUser)
                    );

                    renderProfile(updatedUser);
                    message.textContent = "Profile saved successfully!";
                    modal.querySelector("#profileEditForm").reset();

                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 700);

                } catch (error) {
                    console.error("Save profile error:", error);
                    message.textContent = error.message ||
                        "Could not connect to the backend.";
                } finally {
                    saveButton.disabled = false;
                }
            }
        );
    }
const user = getSavedUser();

if (user) {
    renderProfile(user);
    loadSavedProfile();
}
// ================= LOAD SAVED PROFILE FROM MONGODB =================

async function loadSavedProfile() {
    const user = getSavedUser();
    const token = localStorage.getItem("skillforgeToken");

    if (!user?.id || !token) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/users/${encodeURIComponent(user.id)}/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not load saved profile.");
        }

        const updatedUser = {
            ...user,
            ...result.profile,
            id: user.id
        };

        localStorage.setItem(
            "skillforgeUser",
            JSON.stringify(updatedUser)
        );

        renderProfile(updatedUser);

        console.log("Saved profile and profile photo loaded successfully.");

    } catch (error) {
        console.error("Load saved profile error:", error);
    }
}
    updateProfileSkillCount();
    createProfileModal();

    const editButton = document.getElementById("editProfileBtn");

    if (editButton) {
        editButton.addEventListener("click", async () => {
            const user = getSavedUser();
            const token = localStorage.getItem("skillforgeToken");
            const modal = document.getElementById("profileEditModal");
            const form = document.getElementById("profileEditForm");
            const message = document.getElementById("profileSaveMessage");

            if (!user?.id || !token) {
                alert("Please log in again to edit your profile.");
                return;
            }

            message.textContent = "Loading profile...";

            try {
                const response = await fetch(
                    `${API_URL}/api/users/${encodeURIComponent(user.id)}/profile`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Could not load profile.");
                }

                const profile = result.profile;

                for (const field of [
                    "name", "email", "careerGoal", "branch", "year",
                    "bio", "githubUrl", "linkedinUrl"
                ]) {
                    if (form.elements[field]) {
                        form.elements[field].value = profile[field] || "";
                    }
                }

                message.textContent = "";
                modal.style.display = "flex";

            } catch (error) {
                console.error("Load profile error:", error);
                alert(error.message || "Could not load profile. Check the backend.");
            }
        });
    }
});




// ================= CAMERA VERIFICATION =================

document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("cameraVideo");
    const consent = document.getElementById("cameraConsent");

    const startButton = document.getElementById("startCameraBtn");
    const stopButton = document.getElementById("stopCameraBtn");

    const status = document.getElementById("cameraStatus");
    const placeholder = document.getElementById("cameraPlaceholder");

    const captureButton = document.getElementById("capturePhotoBtn");
    const photoContainer = document.getElementById("capturedPhotoContainer");
    const capturedPhoto = document.getElementById("capturedPhoto");
    const galleryButton = document.getElementById("chooseGalleryPhotoBtn");
const galleryInput = document.getElementById("galleryPhotoInput");

    const retakeButton = document.getElementById("retakePhotoBtn");
    const saveButton = document.getElementById("saveProfilePhotoBtn");
const photoMessage = document.getElementById("profilePhotoMessage");
const deletePhotoButton = document.getElementById("deleteProfilePhotoBtn");
const deletePhotoMessage = document.getElementById("deleteProfilePhotoMessage");
    const canvas = document.getElementById("cameraCanvas");

    // Check that all required HTML elements exist.
    if (
        !video ||
        !consent ||
        !startButton ||
        !stopButton ||
        !status ||
        !placeholder ||
        !captureButton ||
        !photoContainer ||
        !capturedPhoto ||
                !galleryButton ||
        !galleryInput ||
        !retakeButton ||
        !saveButton ||
!photoMessage ||
!deletePhotoButton || !deletePhotoMessage ||
        !canvas
    ) {
        console.error("Camera section: Required HTML elements are missing.");
        return;
    }

    let cameraStream = null;

    // ================= STOP CAMERA FUNCTION =================

    function stopCamera() {

        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
            });

            cameraStream = null;
        }

        video.srcObject = null;
        video.style.display = "none";

        placeholder.style.display = "flex";

        captureButton.style.display = "none";

        status.textContent = "Not Started";

        startButton.disabled = false;
        stopButton.disabled = false;

        consent.checked = false;
    }

    // ================= START CAMERA =================

    startButton.addEventListener("click", async () => {

        if (!consent.checked) {
            alert("Please give camera permission first.");
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            status.textContent = "Camera Not Supported";

            alert(
                "Camera access is not supported here. Open the dashboard using localhost or HTTPS."
            );

            return;
        }

        if (cameraStream) {
            return;
        }

        try {

            startButton.disabled = true;
            status.textContent = "Starting Camera...";

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user"
                },
                audio: false
            });

            video.srcObject = cameraStream;

            await video.play();

            video.style.display = "block";
            placeholder.style.display = "none";

            captureButton.style.display = "inline-block";

            photoContainer.style.display = "none";

            status.textContent = "Camera Active";

            startButton.disabled = false;

        } catch (error) {

            console.error("Camera error:", error);

            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }

            video.srcObject = null;

            status.textContent = "Camera Error";
            startButton.disabled = false;

            alert(
                "Could not start camera. Please check browser permission and try again."
            );
        }

    });
    // ================= CHOOSE PHOTO FROM GALLERY =================

galleryButton.addEventListener("click", () => {
    galleryInput.click();
});

galleryInput.addEventListener("change", () => {
    const file = galleryInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        photoMessage.textContent = "Please select a valid image.";
        galleryInput.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        photoMessage.textContent = "Please select an image smaller than 5 MB.";
        galleryInput.value = "";
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            photoMessage.textContent = "Could not process selected image.";
            URL.revokeObjectURL(imageUrl);
            return;
        }

        context.drawImage(image, 0, 0);

        capturedPhoto.src = canvas.toDataURL("image/jpeg", 0.9);

        photoContainer.style.display = "block";
        captureButton.style.display = "none";
        video.style.display = "none";
        placeholder.style.display = "none";

        status.textContent = "Gallery Photo Selected";
        photoMessage.textContent = "Photo ready. Click Accept & Save Photo.";

        URL.revokeObjectURL(imageUrl);
    };

    image.onerror = () => {
        photoMessage.textContent = "Could not open this image.";
        URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;
});

    // ================= CAPTURE PHOTO =================

    captureButton.addEventListener("click", () => {

        if (!cameraStream || !video.videoWidth || !video.videoHeight) {
            alert("Camera is not ready. Please wait a moment.");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            alert("Could not capture photo.");
            return;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const photoData = canvas.toDataURL("image/jpeg", 0.9);

        capturedPhoto.src = photoData;

        photoContainer.style.display = "block";
        captureButton.style.display = "none";

        status.textContent = "Photo Captured";

    });
// ================= SAVE PROFILE PHOTO =================

saveButton.addEventListener("click", async () => {

    if (!capturedPhoto.src || !canvas.width || !canvas.height) {
        alert("Please capture a photo first.");
        return;
    }

    const user = JSON.parse(
        localStorage.getItem("skillforgeUser") || "{}"
    );

    const token = localStorage.getItem("skillforgeToken");
    const userId = user._id || user.id;

    if (!userId || !token) {
        photoMessage.textContent = "Please login again.";
        return;
    }

    saveButton.disabled = true;
    photoMessage.textContent = "Uploading your photo...";

    try {

        canvas.toBlob(async (blob) => {

            if (!blob) {
                photoMessage.textContent = "Could not process photo.";
                saveButton.disabled = false;
                return;
            }

            try {

                const formData = new FormData();
                formData.append("photo", blob, "profile-photo.jpg");

                const response = await fetch(
                    `https://skillforge-api-45.onrender.com/api/users/${userId}/profile/photo`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Photo upload failed.");
                }

                // Update profile avatar
                const avatar = document.getElementById("profileAvatar");

                if (avatar && data.profilePhoto?.url) {
                    avatar.innerHTML = "";

                    const image = document.createElement("img");
                    image.src = data.profilePhoto.url;
                    image.alt = "Profile photo";

                    image.style.width = "100%";
                    image.style.height = "100%";
                    image.style.objectFit = "cover";
                    image.style.borderRadius = "inherit";

                    avatar.appendChild(image);
                }

                photoMessage.textContent = "Profile photo saved successfully!";
                status.textContent = "Photo Saved";

                saveButton.textContent = "Photo Saved";

            } catch (error) {

                console.error("Photo upload error:", error);
                photoMessage.textContent = error.message;

            } finally {

                saveButton.disabled = false;

            }

        }, "image/jpeg", 0.9);

    } catch (error) {

        console.error("Photo processing error:", error);
        photoMessage.textContent = "Something went wrong.";
        saveButton.disabled = false;

    }

});

deletePhotoButton.addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to delete your profile photo?");

    if (!confirmed) return;

    const user = JSON.parse(
        localStorage.getItem("skillforgeUser") || "{}"
    );

    const token = localStorage.getItem("skillforgeToken");
    const userId = user._id || user.id;

    if (!userId || !token) {
        deletePhotoMessage.textContent = "Please login again.";
        return;
    }

    deletePhotoButton.disabled = true;
    deletePhotoMessage.textContent = "Deleting photo...";

    try {
        const response = await fetch(
            `https://skillforge-api-45.onrender.com/api/users/${userId}/profile/photo`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Photo deletion failed.");
        }

        // Reset dashboard avatar
        const avatar = document.getElementById("profileAvatar");

        if (avatar) {
            const name = user.name || "Student";
            avatar.textContent = name.charAt(0).toUpperCase();
        }

        // Update local storage
        user.profilePhoto = {
            url: "",
            publicId: ""
        };

        localStorage.setItem("skillforgeUser", JSON.stringify(user));

        deletePhotoMessage.textContent = "Profile photo deleted successfully!";

    } catch (error) {
        console.error("Delete photo error:", error);
        deletePhotoMessage.textContent = error.message;
    } finally {
        deletePhotoButton.disabled = false;
    }
});

    // ================= RETAKE PHOTO =================

    retakeButton.addEventListener("click", () => {

        capturedPhoto.src = "";

        photoContainer.style.display = "none";

        if (cameraStream) {
            captureButton.style.display = "inline-block";
            status.textContent = "Camera Active";
        } else {
            status.textContent = "Not Started";
        }

    });

    // ================= STOP CAMERA BUTTON =================

    stopButton.addEventListener("click", () => {

        stopCamera();

        capturedPhoto.src = "";
        photoContainer.style.display = "none";

    });

    // ================= CONSENT REMOVED =================

    consent.addEventListener("change", () => {

        if (!consent.checked && cameraStream) {

            stopCamera();

            capturedPhoto.src = "";
            photoContainer.style.display = "none";

        }

    });

    // Release camera when user leaves the page.
    window.addEventListener("pagehide", () => {

        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }

    });

    console.log("Camera functionality initialized successfully.");

});

 // ================= PERSONALIZED OPPORTUNITIES =================

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://skillforge-api-45.onrender.com";

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem("skillforgeUser") || "{}"
        );
    } catch (error) {
        console.error("Could not read saved user:", error);
    }

    const careerGoal = user.careerGoal || "Web Developer";

    const skills = [
        ...document.querySelectorAll(
            "#skillList .skill-row .skill-info strong"
        )
    ].map(element => element.textContent.trim());

    const skillText = skills.length
        ? skills.join(" ")
        : "HTML CSS JavaScript";

    const searchQuery =
        `${careerGoal} internship ${skillText} India`;

    const searchLinks = [
        {
            title: "LinkedIn",
            url: "https://www.google.com/search?q=" +
                encodeURIComponent(
                    "site:linkedin.com/jobs " + searchQuery
                )
        },
        {
            title: "Unstop",
            url: "https://www.google.com/search?q=" +
                encodeURIComponent(
                    "site:unstop.com " + searchQuery
                )
        },
        {
            title: "Wellfound",
            url: "https://www.google.com/search?q=" +
                encodeURIComponent(
                    "site:wellfound.com " + searchQuery
                )
        }
    ];

    const cards = document.querySelectorAll(
        "#opportunitiesSection .opportunity"
    );

    cards.forEach((card, index) => {
        const info = card.querySelector(".opportunity-info");
        if (!info) return;

        let link = info.querySelector("a");

        if (!link) {
            link = document.createElement("a");
            info.appendChild(link);
        }

        const platform = searchLinks[index];
        if (!platform) return;

        link.href = platform.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `Find matching internships on ${platform.title} ↗`;

        const note = info.querySelector(".personalized-note");

        if (!note) {
            const paragraph = document.createElement("p");
            paragraph.className = "personalized-note";
            paragraph.textContent =
                `Suggested for ${careerGoal}`;
            paragraph.style.fontSize = "12px";
            paragraph.style.opacity = "0.8";
            info.appendChild(paragraph);
        }
    });

    console.log("Personalized opportunity search configured:", {
        careerGoal,
        skills
    });
});


 // ================= APPLICATION TRACKER =================

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://skillforge-api-45.onrender.com";

    const form = document.getElementById("applicationForm");
    const list = document.getElementById("applicationList");
    const message = document.getElementById("applicationMessage");

    if (!form || !list) return;

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem("skillforgeUser") || "{}"
        );
    } catch (error) {
        console.error("Could not read saved user:", error);
    }

    const userId = user._id || user.id || user.userId;
    const token = localStorage.getItem("skillforgeToken");

    function showMessage(text, isError = false) {
        if (!message) return;

        message.textContent = text;
        message.style.color = isError ? "#ff8585" : "#a7f3d0";
    }

    function getHeaders(json = false) {
        const headers = {
            Authorization: `Bearer ${token}`
        };

        if (json) {
            headers["Content-Type"] = "application/json";
        }

        return headers;
    }

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || "Request failed.");
        }

        return data;
    }

    function makeElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;

        if (className) {
            element.className = className;
        }

        return element;
    }

    function renderApplications(applications) {
        const safeApplications = Array.isArray(applications)
    ? applications
    : [];
        
        
        // Application search and status filter
        const searchInput = document.getElementById("applicationSearch");
        const statusFilter = document.getElementById("applicationStatusFilter");

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "All";

       
         

        const filteredApplications = safeApplications.filter(application => {
            const company = (application.company || "").toLowerCase();
            const role = (application.role || "").toLowerCase();

            const matchesSearch =
                company.includes(searchTerm) ||
                role.includes(searchTerm);

            const matchesStatus =
                selectedStatus === "All" ||
                application.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
// Update Application Tracker statistics
const totalStat = document.getElementById("totalApplicationsStat");
const appliedStat = document.getElementById("appliedApplicationsStat");
const interviewStat = document.getElementById("interviewApplicationsStat");
const selectedStat = document.getElementById("selectedApplicationsStat");
const rejectedStat = document.getElementById("rejectedApplicationsStat");

if (totalStat) {
    totalStat.textContent = safeApplications.length;
}

if (appliedStat) {
    appliedStat.textContent = safeApplications.filter(
        app => app.status === "Applied"
    ).length;
}

if (interviewStat) {
    interviewStat.textContent = safeApplications.filter(
        app => app.status === "Interview"
    ).length;
}

if (selectedStat) {
    selectedStat.textContent = safeApplications.filter(
        app => app.status === "Selected"
    ).length;
}

if (rejectedStat) {
    rejectedStat.textContent = safeApplications.filter(
        app => app.status === "Rejected"
    ).length;
}

        list.replaceChildren();

      if (filteredApplications.length === 0) {
    const message = searchTerm || selectedStatus !== "All"
        ? "No applications match your search or selected status."
        : "No applications yet. Add your first application above.";

    list.appendChild(makeElement("p", message));
    return;
}
          

        filteredApplications.forEach(application => {
            const card = document.createElement("div");
            card.style.cssText =
                "padding:16px;border:1px solid rgba(160,140,255,.22);" +
                "border-radius:12px;background:rgba(23,21,38,.75);";

            const heading = makeElement(
                "h3",
                application.company || "Company"
            );
            heading.style.margin = "0 0 6px";

            const role = makeElement(
                "p",
                application.role || "Role"
            );
            role.style.margin = "0 0 12px";
            role.style.color = "#bdb9d0";

            const statusLabel = makeElement("label", "Status: ");
            statusLabel.style.marginRight = "8px";

            const statusSelect = document.createElement("select");
            ["Applied", "Interview", "Selected", "Rejected"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                option.selected = application.status === status;
                statusSelect.appendChild(option);
            });

            statusSelect.style.cssText =
                "padding:8px;border-radius:8px;background:#171526;" +
                "color:white;border:1px solid rgba(160,140,255,.3);";

            statusSelect.addEventListener("change", async () => {
                try {
                    showMessage("Updating status...");

                    await request(
                        `${API_URL}/api/users/${encodeURIComponent(userId)}` +
                        `/applications/${encodeURIComponent(application._id)}`,
                        {
                            method: "PATCH",
                            headers: getHeaders(true),
                            body: JSON.stringify({
                                status: statusSelect.value
                            })
                        }
                    );

                    showMessage("Application status updated.");
                    await loadApplications();
                } catch (error) {
                    showMessage(error.message, true);
                    await loadApplications();
                }
            });

            const controls = document.createElement("div");
            controls.style.cssText =
                "display:flex;align-items:center;gap:10px;flex-wrap:wrap;";

            statusLabel.appendChild(statusSelect);
            controls.appendChild(statusLabel);

            if (application.link) {
                try {
                    const parsedLink = new URL(application.link);

                    if (["http:", "https:"].includes(parsedLink.protocol)) {
                        const link = makeElement("a", "Open application ↗");
                        link.href = parsedLink.href;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.style.color = "#b8a7ff";
                        controls.appendChild(link);
                    }
                } catch (error) {
                    // Ignore an invalid saved link.
                }
            }
            
            // Edit the saved application URL
            const editLinkButton = makeElement("button", "Edit Link");
            editLinkButton.type = "button";
            editLinkButton.style.cssText =
                "padding:8px 12px;border:1px solid #8d79e8;" +
                "border-radius:8px;background:transparent;" +
                "color:#c5b8ff;cursor:pointer;";

            editLinkButton.addEventListener("click", async () => {
                const newLink = prompt(
                    "Enter the actual application URL:",
                    application.link || ""
                );

                // Cancel was clicked.
                if (newLink === null) return;

                const cleanLink = newLink.trim();

                let parsedLink;

                try {
                    parsedLink = new URL(cleanLink);

                    if (!["http:", "https:"].includes(parsedLink.protocol)) {
                        throw new Error("Invalid protocol");
                    }
                } catch {
                    showMessage(
                        "Please enter a valid URL starting with https://",
                        true
                    );
                    return;
                }

                try {
                    editLinkButton.disabled = true;
                    editLinkButton.textContent = "Saving...";

                    await request(
                        `${API_URL}/api/users/${encodeURIComponent(userId)}` +
                        `/applications/${encodeURIComponent(application._id)}/link`,
                        {
                            method: "PATCH",
                            headers: getHeaders(true),
                            body: JSON.stringify({
                                link: parsedLink.href
                            })
                        }
                    );

                    showMessage("Application link updated successfully!");
                    await loadApplications();
                } catch (error) {
                    showMessage(
                        "Could not update link: " + error.message,
                        true
                    );
                    editLinkButton.disabled = false;
                    editLinkButton.textContent = "Edit Link";
                }
            });

            controls.appendChild(editLinkButton);


            const deleteButton = makeElement("button", "Delete");
            deleteButton.type = "button";
            deleteButton.style.cssText =
                "padding:8px 12px;border:1px solid #b65b70;" +
                "border-radius:8px;background:transparent;color:#ff9aaa;cursor:pointer;";

            deleteButton.addEventListener("click", async () => {
                if (!confirm(`Delete application at ${application.company}?`)) {
                    return;
                }

                try {
                    await request(
                        `${API_URL}/api/users/${encodeURIComponent(userId)}` +
                        `/applications/${encodeURIComponent(application._id)}`,
                        {
                            method: "DELETE",
                            headers: getHeaders()
                        }
                    );

                    showMessage("Application deleted.");
                    await loadApplications();
                } catch (error) {
                    showMessage(error.message, true);
                }
            });

            controls.appendChild(deleteButton);

            card.append(heading, role, controls);

            if (application.appliedAt) {
                const date = new Date(application.appliedAt);

                if (!Number.isNaN(date.getTime())) {
                    const dateText = makeElement(
                        "small",
                        `Added: ${date.toLocaleDateString("en-IN")}`
                    );
                    dateText.style.cssText =
                        "display:block;margin-top:10px;color:#9690ae;";
                    card.appendChild(dateText);
                }
            }

            list.appendChild(card);
        });
    }

    async function loadApplications() {
        if (!userId || !token) {
            showMessage(
                "Please log in again. Your user ID or login token is missing.",
                true
            );
            return;
        }

        try {
            const data = await request(
                `${API_URL}/api/users/${encodeURIComponent(userId)}/applications`,
                { headers: getHeaders() }
            );

            const applications = Array.isArray(data)
                ? data
                : data.applications || data.data || [];

            renderApplications(applications);
        } catch (error) {
            showMessage("Could not load applications: " + error.message, true);
        }
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!userId || !token) {
            showMessage("Please log in again before adding an application.", true);
            return;
        }

        const company = document.getElementById("applicationCompany").value.trim();
        const role = document.getElementById("applicationRole").value.trim();
        const link = document.getElementById("applicationLink").value.trim();
        const status = document.getElementById("applicationStatus").value;

        if (!company || !role) {
            showMessage("Enter both company name and role.", true);
            return;
        }

        try {
            showMessage("Saving application...");

            await request(
                `${API_URL}/api/users/${encodeURIComponent(userId)}/applications`,
                {
                    method: "POST",
                    headers: getHeaders(true),
                    body: JSON.stringify({ company, role, link, status })
                }
            );

            form.reset();
            showMessage("Application saved successfully!");
            await loadApplications();
        } catch (error) {
            showMessage("Could not save application: " + error.message, true);
        }
    });

    loadApplications();
});

/* ==========================================
   AI MOCK INTERVIEW — SkillForge-AI
   Add this block at the END of dashboard.js
========================================== */

(() => {
    const form = document.getElementById("mockInterviewForm");
    const message = document.getElementById("mockInterviewMessage");
    const workspace = document.getElementById("mockInterviewWorkspace");
    const historyContainer = document.getElementById("mockInterviewHistory");
    const refreshHistoryBtn = document.getElementById("refreshMockInterviewHistory");
    const startBtn = document.getElementById("startMockInterviewBtn");

    // Prevent errors if this section is not present on another page.
    if (!form || !workspace || !message || !historyContainer) return;

    const API = "https://skillforge-api-45.onrender.com/api/mock-interviews";

    let currentInterview = null;
    let currentIndex = 0;
    let answerSubmitted = false;
    let isBusy = false;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getToken() {
        return localStorage.getItem("skillforgeToken");
    }

    async function apiRequest(url, options = {}) {
        const token = getToken();

        if (!token) {
            throw new Error("Please log in again. Your login token was not found.");
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status}).`);
        }

        return data;
    }

    function showMessage(text, type = "info") {
        message.textContent = text;
        message.style.color =
            type === "error" ? "#ff7777" :
            type === "success" ? "#69e6a6" : "inherit";
    }

    function setBusy(busy) {
        isBusy = busy;
        if (startBtn) startBtn.disabled = busy;
        if (refreshHistoryBtn) refreshHistoryBtn.disabled = busy;

        workspace.querySelectorAll("button, textarea").forEach(element => {
            element.disabled = busy;
        });
    }

    function renderQuestion() {
        if (!currentInterview) return;

        const questions = currentInterview.questions || [];
        const question = questions[currentIndex];

        if (!question) {
            workspace.innerHTML = `
                <p>All questions have been answered.</p>
                <button type="button" id="completeMockInterviewBtn"
                    class="primary-dashboard-button">
                    Complete Interview →
                </button>
            `;
            document.getElementById("completeMockInterviewBtn")
                ?.addEventListener("click", completeInterview);
            return;
        }

        answerSubmitted = Boolean(
            question.answer && question.score !== undefined && question.score !== null
        );

        const questionText = typeof question === "string"
            ? question
            : question.question || "Interview question";

        workspace.innerHTML = `
            <div class="mock-question-card">
                <p class="card-label">
                    QUESTION ${currentIndex + 1} OF ${questions.length}
                </p>

                <h3>${escapeHTML(questionText)}</h3>

                <label for="mockInterviewAnswer">Your answer</label>
                <textarea
                    id="mockInterviewAnswer"
                    rows="5"
                    maxlength="5000"
                    placeholder="Write your answer here..."
                    ${answerSubmitted ? "disabled" : ""}
                >${answerSubmitted ? escapeHTML(question.answer) : ""}</textarea>

                <div id="mockInterviewEvaluation">
                    ${answerSubmitted ? renderEvaluation(question) : ""}
                </div>

                <div class="mock-interview-actions">
                    ${!answerSubmitted ? `
                        <button type="button" id="submitMockAnswerBtn"
                            class="primary-dashboard-button">
                            Submit Answer →
                        </button>
                    ` : `
                        <button type="button" id="nextMockQuestionBtn"
                            class="primary-dashboard-button">
                            ${currentIndex === questions.length - 1
                                ? "Complete Interview →"
                                : "Next Question →"}
                        </button>
                    `}
                </div>
            </div>
        `;

        document.getElementById("submitMockAnswerBtn")
            ?.addEventListener("click", submitAnswer);

        document.getElementById("nextMockQuestionBtn")
            ?.addEventListener("click", nextQuestion);
    }

    function renderEvaluation(question) {
        const score = question.score;
        const strengths = Array.isArray(question.strengths)
            ? question.strengths : [];
        const improvements = Array.isArray(question.improvements)
            ? question.improvements : [];

        return `
            <div class="mock-evaluation">
                <h4>AI Feedback</h4>
                ${score !== undefined && score !== null
                    ? `<p><strong>Score:</strong> ${escapeHTML(score)}/10</p>`
                    : ""}
                <p>${escapeHTML(question.feedback || "No feedback available.")}</p>

                ${strengths.length ? `
                    <p><strong>What you did well</strong></p>
                    <ul>${strengths.map(item =>
                        `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                ` : ""}

                ${improvements.length ? `
                    <p><strong>Areas to improve</strong></p>
                    <ul>${improvements.map(item =>
                        `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                ` : ""}
            </div>
        `;
    }

    // Start a new interview.
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (isBusy) return;

        const role = document.getElementById("mockInterviewRole").value.trim();
        const interviewType = document.getElementById("mockInterviewType").value;
        const difficulty = document.getElementById("mockInterviewDifficulty").value;

        if (!role) {
            showMessage("Please enter your target job role.", "error");
            return;
        }

        setBusy(true);
        showMessage("Generating interview questions with AI. Please wait...");
        workspace.innerHTML = "";

        try {
            const data = await apiRequest(`${API}/start`, {
                method: "POST",
                body: JSON.stringify({ role, interviewType, difficulty })
            });

            if (!data.interview || !Array.isArray(data.interview.questions)
                || !data.interview.questions.length) {
                throw new Error("The server did not return any interview questions.");
            }

            currentInterview = data.interview;
            currentIndex = 0;
            showMessage("Your interview is ready. Give your best answer!", "success");
            renderQuestion();
            await loadInterviewHistory();
        } catch (error) {
            showMessage(error.message || "Could not start the interview.", "error");
        } finally {
            setBusy(false);
        }
    });

    // Submit the current answer for AI evaluation.
    async function submitAnswer() {
        if (isBusy || !currentInterview) return;

        const question = currentInterview.questions[currentIndex];
        const answerInput = document.getElementById("mockInterviewAnswer");
        const answer = answerInput?.value.trim();

        if (!answer) {
            showMessage("Please write your answer before submitting.", "error");
            return;
        }

        if (!question?._id) {
            showMessage(
                "This question has no ID. Check the MockInterview model and start API response.",
                "error"
            );
            return;
        }

        setBusy(true);
        showMessage("AI is evaluating your answer...");

        try {
            const data = await apiRequest(
                `${API}/${encodeURIComponent(currentInterview._id)}/questions/${encodeURIComponent(question._id)}/answer`,
                {
                    method: "POST",
                    body: JSON.stringify({ answer })
                }
            );

            const evaluatedQuestion = data.question || {};
            Object.assign(question, evaluatedQuestion, { answer });

            // Keep the saved answer even if the API returns only evaluation fields.
            question.answer = evaluatedQuestion.answer || answer;

            showMessage("Answer evaluated successfully!", "success");
            renderQuestion();
            await loadInterviewHistory();
        } catch (error) {
            showMessage(error.message || "Could not evaluate your answer.", "error");
        } finally {
            setBusy(false);
        }
    }

    async function nextQuestion() {
        if (isBusy || !currentInterview) return;

        const question = currentInterview.questions[currentIndex];

        if (!question || question.score === undefined || question.score === null) {
            showMessage("Submit your answer and receive feedback first.", "error");
            return;
        }

        if (currentIndex < currentInterview.questions.length - 1) {
            currentIndex++;
            showMessage("");
            renderQuestion();
        } else {
            await completeInterview();
        }
    }

    // Finish the interview and display the overall result.
    async function completeInterview() {
        if (isBusy || !currentInterview) return;

        const allAnswered = currentInterview.questions.every(question =>
            question.answer &&
            question.score !== undefined &&
            question.score !== null
        );

        if (!allAnswered) {
            showMessage("Please answer and submit every question first.", "error");
            return;
        }

        setBusy(true);
        showMessage("Calculating your final score and feedback...");

        try {
            const data = await apiRequest(
                `${API}/${encodeURIComponent(currentInterview._id)}/complete`,
                { method: "POST", body: JSON.stringify({}) }
            );

            currentInterview = data.interview || currentInterview;

            const result = currentInterview;
            const recommendations = Array.isArray(result.recommendations)
                ? result.recommendations : [];

            workspace.innerHTML = `
                <div class="mock-interview-result">
                    <p class="card-label">INTERVIEW COMPLETED</p>
                    <h3>🎉 Interview Result</h3>
                    <p><strong>Role:</strong> ${escapeHTML(result.role)}</p>
                    <p><strong>Overall Score:</strong>
                        ${escapeHTML(result.overallScore ?? "N/A")}%</p>
                    <p><strong>Summary:</strong>
                        ${escapeHTML(result.summary || "No summary provided.")}</p>

                    ${recommendations.length ? `
                        <h4>Recommended next steps</h4>
                        <ul>${recommendations.map(item =>
                            `<li>${escapeHTML(item)}</li>`).join("")}</ul>
                    ` : ""}

                    <button type="button" id="startAnotherMockInterviewBtn"
                        class="primary-dashboard-button">
                        Start Another Interview →
                    </button>
                </div>
            `;

            document.getElementById("startAnotherMockInterviewBtn")
                ?.addEventListener("click", () => {
                    currentInterview = null;
                    currentIndex = 0;
                    workspace.innerHTML = "";
                    form.reset();
                    document.getElementById("mockInterviewRole")?.focus();
                    showMessage("Ready for your next interview.");
                });

            showMessage("Interview completed and saved!", "success");
            await loadInterviewHistory();
        } catch (error) {
            showMessage(error.message || "Could not complete the interview.", "error");
        } finally {
            setBusy(false);
        }
    }

    // Load saved interview sessions from MongoDB.
    async function loadInterviewHistory() {
        try {
            const data = await apiRequest(API, { method: "GET" });
            const interviews = Array.isArray(data.interviews) ? data.interviews : [];

            if (!interviews.length) {
                historyContainer.innerHTML = "<p>No previous interviews yet.</p>";
                return;
            }

            historyContainer.innerHTML = interviews.map(interview => `
                <div class="mock-history-item">
                    <h4>${escapeHTML(interview.role || "Interview")}</h4>
                    <p>
                        ${escapeHTML(interview.interviewType || "Mixed")} ·
                        ${escapeHTML(interview.difficulty || "Beginner")}
                    </p>
                    <p>
                        Status: ${escapeHTML(interview.status || "in progress")}
                        ${interview.overallScore !== undefined &&
                          interview.overallScore !== null
                            ? ` · Score: ${escapeHTML(interview.overallScore)}%`
                            : ""}
                    </p>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
    <button type="button"
        class="card-button mock-history-view"
        data-interview-id="${escapeHTML(interview._id)}">
        View Details
    </button>

    <button type="button"
        class="card-button mock-history-delete"
        data-interview-id="${escapeHTML(interview._id)}"
        style="background:#7f1d2d;color:#fff;border:1px solid #ef4444;">
        🗑 Delete
    </button>
</div>
                </div>
            `).join("");

            historyContainer.querySelectorAll(".mock-history-view")
                .forEach(button => {
                    button.addEventListener("click", () =>
                        viewInterviewHistory(button.dataset.interviewId)
                    );
                });


                historyContainer.querySelectorAll(".mock-history-delete")
    .forEach(button => {
        button.addEventListener("click", async () => {
            const interviewId = button.dataset.interviewId;

            if (!interviewId || isBusy) return;

            const confirmed = confirm(
                "Are you sure you want to delete this interview history? This action cannot be undone."
            );

            if (!confirmed) return;

            button.disabled = true;
            button.textContent = "Deleting...";

            try {
                await apiRequest(
                    `${API}/${encodeURIComponent(interviewId)}`,
                    { method: "DELETE" }
                );

                // Clear the workspace if the deleted interview is open.
                if (currentInterview?._id === interviewId) {
                    currentInterview = null;
                    currentIndex = 0;
                    workspace.innerHTML = "";
                }

                showMessage(
                    "Interview history deleted successfully!",
                    "success"
                );

                await loadInterviewHistory();
            } catch (error) {
                showMessage(
                    error.message || "Could not delete interview history.",
                    "error"
                );

                button.disabled = false;
                button.textContent = "🗑 Delete";
            }
        });
    });
        } catch (error) {
            historyContainer.innerHTML =
                `<p>Could not load interview history: ${escapeHTML(error.message)}</p>`;
        }
    }

    async function viewInterviewHistory(interviewId) {
        if (isBusy) return;

        setBusy(true);
        showMessage("Loading saved interview...");

        try {
            const data = await apiRequest(
                `${API}/${encodeURIComponent(interviewId)}`,
                { method: "GET" }
            );

            const interview = data.interview;

            if (!interview) throw new Error("Interview details were not returned.");

            const questionsHTML = (interview.questions || []).map((question, index) => `
                <div class="mock-question-card">
                    <h4>Question ${index + 1}</h4>
                    <p>${escapeHTML(question.question || "")}</p>
                    <p><strong>Your answer:</strong>
                        ${escapeHTML(question.answer || "Not answered")}</p>
                    ${question.score !== undefined && question.score !== null
                        ? renderEvaluation(question) : ""}
                </div>
            `).join("");

            workspace.innerHTML = `
                <div class="mock-interview-result">
                    <h3>${escapeHTML(interview.role || "Saved Interview")}</h3>
                    <p><strong>Status:</strong> ${escapeHTML(interview.status || "")}</p>
                    <p><strong>Overall Score:</strong>
                        ${escapeHTML(interview.overallScore ?? "Not completed")}${interview.overallScore !== undefined && interview.overallScore !== null ? "%" : ""}</p>
                    ${interview.summary
                        ? `<p><strong>Summary:</strong> ${escapeHTML(interview.summary)}</p>`
                        : ""}
                    ${questionsHTML}
                    <button type="button" id="closeMockHistoryBtn"
                        class="card-button">Close Details</button>
                </div>
            `;

            document.getElementById("closeMockHistoryBtn")
                ?.addEventListener("click", () => {
                    workspace.innerHTML = "";
                    showMessage("");
                });

            showMessage("Saved interview loaded.", "success");
        } catch (error) {
            showMessage(error.message || "Could not load interview details.", "error");
        } finally {
            setBusy(false);
        }
    }

    refreshHistoryBtn?.addEventListener("click", loadInterviewHistory);

    // Load previous sessions when the dashboard opens.
    loadInterviewHistory();
})();

/* ==========================================
   SAVED OPPORTUNITIES — MONGODB
========================================== */

(() => {
    const API_URL = "https://skillforge-api-45.onrender.com";
    const list = document.querySelector("#opportunitiesSection .opportunity-list");

    if (!list) return;

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem("skillforgeUser") || "null");
        } catch {
            return null;
        }
    }

    function getHeaders(json = false) {
        const headers = {
            Authorization: `Bearer ${localStorage.getItem("skillforgeToken") || ""}`
        };

        if (json) headers["Content-Type"] = "application/json";
        return headers;
    }

    function getUserId() {
        const user = getUser();
        return user?.id || user?._id || user?.userId || null;
    }

    async function getSavedOpportunities() {
        const userId = getUserId();
        if (!userId || !localStorage.getItem("skillforgeToken")) return [];

        const response = await fetch(
            `${API_URL}/api/users/${encodeURIComponent(userId)}/saved-opportunities`,
            { headers: getHeaders() }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not load saved opportunities.");
        }

        return data.opportunities || [];
    }

    async function refreshSaveButtons() {
        try {
            const saved = await getSavedOpportunities();
            const savedIds = new Set(saved.map(item => String(item._id)));

            list.querySelectorAll(".save-opportunity-btn").forEach(button => {
                const id = button.dataset.opportunityId;
                const isSaved = savedIds.has(id);

                button.textContent = isSaved ? "✓ Saved" : "☆ Save Opportunity";
                button.dataset.saved = String(isSaved);
                button.setAttribute("aria-pressed", String(isSaved));
            });
        } catch (error) {
            console.error("Could not load saved opportunities:", error);
        }
    }

    list.addEventListener("click", async event => {
        const button = event.target.closest(".save-opportunity-btn");
        if (!button) return;

        const userId = getUserId();
        const token = localStorage.getItem("skillforgeToken");
        const opportunityId = button.dataset.opportunityId;

        if (!userId || !token) {
            alert("Please log in again to save opportunities.");
            return;
        }

        if (!opportunityId) {
            alert("Opportunity ID is missing. Please refresh the dashboard.");
            return;
        }

        const wasSaved = button.dataset.saved === "true";
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = wasSaved ? "Removing..." : "Saving...";

        try {
            let response;

            if (wasSaved) {
                response = await fetch(
                    `${API_URL}/api/users/${encodeURIComponent(userId)}/saved-opportunities/${encodeURIComponent(opportunityId)}`,
                    {
                        method: "DELETE",
                        headers: getHeaders()
                    }
                );
            } else {
                response = await fetch(
                    `${API_URL}/api/users/${encodeURIComponent(userId)}/saved-opportunities`,
                    {
                        method: "POST",
                        headers: getHeaders(true),
                        body: JSON.stringify({ opportunityId })
                    }
                );
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not update saved opportunity.");
            }

            await refreshSaveButtons();
        } catch (error) {
            console.error("Save opportunity error:", error);
            button.textContent = originalText;
            alert(error.message || "Could not update saved opportunity.");
        } finally {
            button.disabled = false;
        }
    });

    // The opportunities list is rendered asynchronously by dashboard.html.
    // Watch for new cards and add a Save button to each API-rendered card.
    const observer = new MutationObserver(() => {
        list.querySelectorAll(".opportunity").forEach(card => {
            const link = card.querySelector(".opportunity-info a");
            if (!link || card.querySelector(".save-opportunity-btn")) return;

            // Only add buttons to cards with a real MongoDB opportunity ID.
            const opportunityId = card.dataset.opportunityId;
            if (!opportunityId) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "save-opportunity-btn card-button";
            button.dataset.opportunityId = opportunityId;
            button.dataset.saved = "false";
            button.textContent = "☆ Save Opportunity";
            button.style.cssText =
                "display:block;margin-top:12px;padding:9px 12px;" +
                "border-radius:8px;cursor:pointer;";

            link.insertAdjacentElement("afterend", button);
        });

        refreshSaveButtons();
    });

    observer.observe(list, { childList: true, subtree: true });

    refreshSaveButtons();
})();

/* ==========================================
   APPLY & TRACK — EXISTING APPLICATION API
========================================== */

(() => {
    const API_URL = "https://skillforge-api-45.onrender.com";
    const list = document.querySelector(
        "#opportunitiesSection .opportunity-list"
    );

    if (!list) return;

    function getUserId() {
        try {
            const user = JSON.parse(
                localStorage.getItem("skillforgeUser") || "null"
            );

            return user?.id || user?._id || user?.userId || null;
        } catch {
            return null;
        }
    }

    function addTrackButtons() {
        list.querySelectorAll(".opportunity").forEach(card => {
            if (card.querySelector(".apply-track-btn")) return;

            const link = card.querySelector(".opportunity-info a");
            const company = card.dataset.company;
            const role = card.dataset.role;

            // Only use real opportunities loaded from the API.
            if (!card.dataset.opportunityId || !company || !role || !link) {
                return;
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "apply-track-btn";
            button.textContent = "Apply & Track";
            button.style.cssText =
                "display:inline-block;margin-top:12px;padding:10px 15px;" +
                "border:0;border-radius:8px;cursor:pointer;" +
                "background:#8057e8;color:white;font-weight:600;";

            link.insertAdjacentElement("afterend", button);
        });
    }

    list.addEventListener("click", async event => {
        const button = event.target.closest(".apply-track-btn");
        if (!button) return;

        const card = button.closest(".opportunity");
        const userId = getUserId();
        const token = localStorage.getItem("skillforgeToken");
        const applyLink = card.querySelector(".opportunity-info a")?.href;

        if (!userId || !token) {
            alert("Please log in again to track your application.");
            return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Adding to Tracker...";

        try {
            const response = await fetch(
                `${API_URL}/api/users/${encodeURIComponent(userId)}/applications`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        company: card.dataset.company,
                        role: card.dataset.role,
                        link: applyLink || "",
                        status: "Applied"
                    })
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message || "Could not add this application."
                );
            }

            // Open the opportunity after successfully tracking it.
            if (applyLink) {
                window.open(applyLink, "_blank", "noopener,noreferrer");
            }

            alert("Application added to your Application Tracker!");

            window.location.hash = "applicationTrackerSection";
            window.location.reload();
        } catch (error) {
            console.error("Apply & Track error:", error);
            alert(error.message || "Something went wrong.");
            button.disabled = false;
            button.textContent = originalText;
        }
    });

    addTrackButtons();

    const observer = new MutationObserver(addTrackButtons);
    observer.observe(list, {
        childList: true,
        subtree: true
    });
})();
// ========== SKILLFORGE AI LOGOUT ==========

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        localStorage.removeItem("skillforgeToken");
        localStorage.removeItem("skillforgeUser");
alert("Logout successful. Redirecting to login...");
        window.location.href = "http://localhost:5500/SkillForge-AI/frontend/login.html";
    });
});