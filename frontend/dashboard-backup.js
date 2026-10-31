// SkillForge AI - AI Career Assistant

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("aiQuestion");
    const button = document.getElementById("askAIButton");
    const chatBox = document.getElementById("aiChatBox");

    if (!input || !button || !chatBox) {
        console.log("AI Assistant elements not found");
        return;
    }

    button.addEventListener("click", async () => {

        const question = input.value.trim();

        if (!question) {
            return;
        }

        // Get logged-in user
        const savedUser = localStorage.getItem("skillforgeUser");
        const user = savedUser ? JSON.parse(savedUser) : {};

        const careerGoal = user.careerGoal || "Career goal not specified";

        // Get skills from dashboard
        const skills = [
            ...document.querySelectorAll(".skill-row .skill-info strong")
        ].map(skill => skill.textContent.trim());

        const userMessage = document.createElement("div");
        userMessage.className = "ai-message";
        userMessage.textContent = "You: " + question;

        chatBox.appendChild(userMessage);

        input.value = "";

        const thinkingMessage = document.createElement("div");
        thinkingMessage.className = "ai-message";
        thinkingMessage.textContent = "🤖 SkillForge AI is thinking...";

        chatBox.appendChild(thinkingMessage);

        try {

            const response = await fetch(
                "http://localhost:5000/api/ai-assistant",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        question: question,
                        careerGoal: careerGoal,
                        skills: skills
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                thinkingMessage.textContent =
                    "🤖 " + data.answer;

            } else {

                thinkingMessage.textContent =
                    "❌ Something went wrong.";

            }

        } catch (error) {

            console.error(error);

            thinkingMessage.textContent =
                "❌ Could not connect to SkillForge AI backend.";

        }

        chatBox.scrollTop = chatBox.scrollHeight;

    });

});
// ================= LIVE SKILL GAP ANALYZER =================

const analyzeButton = document.getElementById("analyzeSkillsBtn");

if (analyzeButton) {

    analyzeButton.addEventListener("click", async () => {

        const savedUser = localStorage.getItem("skillforgeUser");
        const user = savedUser ? JSON.parse(savedUser) : {};

        const careerGoal = user.careerGoal || "Web Developer";

        const skills = [
            ...document.querySelectorAll(
                ".skill-row .skill-info strong"
            )
        ].map(skill => skill.textContent.trim());

        analyzeButton.textContent = "Analyzing...";

        try {

            const response = await fetch(
                "http://localhost:5000/api/analyze-skills",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        skills: skills,
                        careerGoal: careerGoal
                    })
                }
            );

            const data = await response.json();

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
generatePersonalizedRoadmap(data.missingSkills, data.careerGoal);
        } catch (error) {

            console.error(error);

            analyzeButton.textContent = "Analyze My Skills →";

            alert("Could not connect to SkillForge AI backend.");
        }

    });

}
// ================= PERSONALIZED ROADMAP =================

async function generatePersonalizedRoadmap(missingSkills, careerGoal) {

    try {

        const response = await fetch(
            "http://localhost:5000/api/learning-roadmap",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
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

                        <p>
                            ${item.status} • ${item.duration}
                        </p>
                    </div>
                `).join("")}

            </div>
        `;

    } catch (error) {

        console.error("Roadmap error:", error);

    }

}
// ================= ROADMAP PROGRESS TRACKING =================

document.addEventListener("click", (event) => {

    if (!event.target.classList.contains("roadmap-start-btn")) {
        return;
    }

    const button = event.target;
    const skill = button.dataset.skill;

    button.textContent = "Completed ✓";
    button.disabled = true;

    button.style.opacity = "0.6";

    const savedProgress =
        JSON.parse(localStorage.getItem("skillforgeProgress") || "{}");

    savedProgress[skill] = true;

    localStorage.setItem(
        "skillforgeProgress",
        JSON.stringify(savedProgress)
    );

});
// ================= LOAD SAVED ROADMAP PROGRESS =================

document.addEventListener("DOMContentLoaded", () => {

    const savedProgress =
        JSON.parse(localStorage.getItem("skillforgeProgress") || "{}");

    document.querySelectorAll(".roadmap-start-btn").forEach(button => {

        const skill = button.dataset.skill;

        if (savedProgress[skill]) {
            button.textContent = "Completed ✓";
            button.disabled = true;
            button.style.opacity = "0.6";
        }

    });

});
// ================= UPDATE ROADMAP PROGRESS =================

function updateRoadmapProgress() {

    const buttons =
        document.querySelectorAll(".roadmap-start-btn");

    const progressElement =
        document.getElementById("roadmapProgress");

    if (!buttons.length || !progressElement) {
        return;
    }

    const completed =
        [...buttons].filter(button => button.disabled).length;

    const percentage =
        Math.round((completed / buttons.length) * 100);

    progressElement.textContent = percentage + "%";
}

document.addEventListener("click", (event) => {

    if (event.target.classList.contains("roadmap-start-btn")) {

        setTimeout(() => {
            updateRoadmapProgress();
        }, 50);

    }

});

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {
        updateRoadmapProgress();
    }, 100);

});
// ================= CAREER PROFILE =================

async function loadCareerProfile() {

    const savedUser = localStorage.getItem("skillforgeUser");
    const user = savedUser ? JSON.parse(savedUser) : {};

    const careerGoal = user.careerGoal || "Web Developer";

    const skills = [
        ...document.querySelectorAll(
            ".skill-row .skill-info strong"
        )
    ].map(skill => skill.textContent.trim());

    try {

        const response = await fetch(
            "http://localhost:5000/api/career-profile",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    careerGoal: careerGoal,
                    skills: skills
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        let profileBox =
            document.getElementById("careerProfileCard");

        if (!profileBox) {

            profileBox = document.createElement("div");
            profileBox.id = "careerProfileCard";

            const dashboardHeader =
    document.querySelector("main");

          document.querySelector(".dashboard-footer")
    .before(profileBox);
        }

        profileBox.innerHTML = `
            <div style="
                margin: 20px 0;
                padding: 24px;
                border-radius: 16px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
            ">

                <h2>🎯 Career Profile</h2>

                <p>
                    <strong>Career Goal:</strong>
                    ${data.profile.careerGoal}
                </p>

                <p>
                    <strong>Total Skills:</strong>
                    ${data.profile.totalSkills}
                </p>

                <p>
                    <strong>Career Match:</strong>
                    ${data.profile.matchPercentage}%
                </p>

                <p>
                    <strong>Matched Skills:</strong>
                    ${
                        data.profile.matchedSkills.length
                        ? data.profile.matchedSkills.join(", ")
                        : "None yet"
                    }
                </p>

                <p>
                    <strong>Skills to Learn:</strong>
                    ${
                        data.profile.missingSkills.length
                        ? data.profile.missingSkills.join(", ")
                        : "No major skill gaps 🎉"
                    }
                </p>

            </div>
        `;

    } catch (error) {

        console.error("Career Profile Error:", error);

    }
}


// Load career profile when dashboard opens

document.addEventListener("DOMContentLoaded", () => {
    loadCareerProfile();
});
// ================= REAL MONGODB SKILL FEATURE =================

document.addEventListener("DOMContentLoaded", () => {

    const addSkillBtn = document.getElementById("addSkillBtn");
    const skillList = document.getElementById("skillList");

    if (!addSkillBtn || !skillList) {
        console.log("Add Skill elements not found");
        return;
    }

    const API_URL = "http://localhost:5000";

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

            const response = await fetch(
                `${API_URL}/api/users/${userId}/skills`
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

            console.log(
                "Skills loaded from MongoDB:",
                data.skills
            );

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

            const response = await fetch(
                `${API_URL}/api/users/${userId}/skills/${encodeURIComponent(skillName)}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            await loadSkillsFromDatabase();

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
            <h3 style="margin-bottom:12px;">
                ➕ Add New Skill
            </h3>

            <select id="newSkillName"
                style="
                    width:100%;
                    padding:12px;
                    margin-bottom:12px;
                    border-radius:8px;
                "
            >
                <option value="">Select Skill</option>
                <option value="C++">C++</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React.js">React.js</option>
                <option value="Node.js">Node.js</option>
                <option value="SQL">SQL</option>
                <option value="Git & GitHub">Git & GitHub</option>
            </select>

            <button
                id="saveSkillBtn"
                class="primary-dashboard-button"
            >
                Save Skill
            </button>

            <button
                id="cancelSkillBtn"
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

        const skillName =
            document.getElementById("newSkillName").value;

        if (!skillName) {
            alert("Please select a skill.");
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
                        "Content-Type": "application/json"
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

        const count =
            document.querySelectorAll(
                ".skill-row .skill-info strong"
            ).length;

        const skillStat =
            document.querySelector(".stat-card h2");

        if (skillStat) {
            skillStat.textContent = count;
        }

        const profileCount =
            document.getElementById(
                "profileSkillCount"
            );

        if (profileCount) {
            profileCount.textContent = count;
        }
    }


    // Load skills from MongoDB
    loadSkillsFromDatabase();

});

// ================= PROFILE CARD =================

document.addEventListener("DOMContentLoaded", () => {

    const savedUser = localStorage.getItem("skillforgeUser");

    if (!savedUser) { 
        return;
    }

    const user = JSON.parse(savedUser);

    const name = user.name || "Student";
    const careerGoal = user.careerGoal || "Career Goal";
    const branch = user.branch || "CSE";
    const year = user.year || "1st Year";

    const profileCardName =
        document.getElementById("profileCardName");

    const profileCardGoal =
        document.getElementById("profileCardGoal");

    const profileBranch =
        document.getElementById("profileBranch");

    const profileYear =
        document.getElementById("profileYear");

    const profileAvatar =
        document.getElementById("profileAvatar");

    if (profileCardName) {
        profileCardName.textContent = name;
    }

    if (profileCardGoal) {
        profileCardGoal.textContent = careerGoal;
    }

    if (profileBranch) {
        profileBranch.textContent = branch;
    }

    if (profileYear) {
        profileYear.textContent = year;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            name.charAt(0).toUpperCase();
    }

    updateProfileSkillCount();

    const editButton =
        document.getElementById("editProfileBtn");

    if (editButton) {

        editButton.addEventListener("click", () => {

            alert(
                "Profile editing module is ready for the next step 🚀"
            );

        });

    }

});


// ================= PROFILE SKILL COUNT =================

function updateProfileSkillCount() {

    const skills =
        document.querySelectorAll(
            ".skill-row .skill-info strong"
        );

    const countElement =
        document.getElementById("profileSkillCount");

    if (countElement) {
        countElement.textContent = skills.length;
    }
}


// ================= CAMERA VERIFICATION =================

document.addEventListener("DOMContentLoaded", () => {

    const video =
        document.getElementById("cameraVideo");

    const consent =
        document.getElementById("cameraConsent");

    const startButton =
        document.getElementById("startCameraBtn");

    const stopButton =
        document.getElementById("stopCameraBtn");

    const status =
        document.getElementById("cameraStatus");

    const placeholder =
        document.getElementById("cameraPlaceholder");

    if (
        !video ||
        !consent ||
        !startButton ||
        !stopButton
    ) {
        return;
    }

    let cameraStream = null;


    // ================= START CAMERA =================

    startButton.addEventListener(
        "click",
        async () => {

            if (!consent.checked) {

                alert(
                    "Please give camera permission first."
                );

                return;
            }

            try {

                cameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });

                video.srcObject =
                    cameraStream;

                video.style.display =
                    "block";

                if (placeholder) {
                    placeholder.style.display =
                        "none";
                }

                if (status) {
                    status.textContent =
                        "Camera Active";
                }

            } catch (error) {

                console.error(
                    "Camera error:",
                    error
                );

                if (status) {
                    status.textContent =
                        "Permission Denied";
                }

                alert(
                    "Camera permission was not granted. Please allow camera access in your browser."
                );
            }

        }
    );


    // ================= STOP CAMERA =================

    stopButton.addEventListener(
        "click",
        () => {

            if (cameraStream) {

                cameraStream
                    .getTracks()
                    .forEach(track => {
                        track.stop();
                    });

                cameraStream = null;
            }

            video.srcObject = null;

            video.style.display =
                "none";

            if (placeholder) {
                placeholder.style.display =
                    "flex";
            }

            if (status) {
                status.textContent =
                    "Not Started";
            }

            consent.checked = false;

        }
    );

});

