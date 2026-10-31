
/* ==========================================
   SkillForge AI - Portfolio Studio
   Portfolio generation, AI editing,
   task tracking, saved projects & preview
========================================== */

function initBuildAgent() {
    // ==========================================
    // 1. HTML ELEMENTS
    // ==========================================

    const form = document.getElementById("buildAgentForm");
    const ideaInput = document.getElementById("buildProjectIdea");
    const daysInput = document.getElementById("buildProjectDays");
    const levelInput = document.getElementById("buildProjectLevel");
    const techInput = document.getElementById("buildProjectTech");

    const submitButton = document.getElementById("buildAgentSubmit");
    const statusBox = document.getElementById("buildAgentStatus");
    const workspace = document.getElementById("buildAgentWorkspace");

    // Portfolio fields
    const portfolioNameInput = document.getElementById("portfolioName");
    const portfolioRoleInput = document.getElementById("portfolioRole");
    const portfolioSkillsInput = document.getElementById("portfolioSkills");
    const portfolioProjectsInput = document.getElementById("portfolioProjects");
    const portfolioGithubInput = document.getElementById("portfolioGithub");
    const portfolioLinkedinInput = document.getElementById("portfolioLinkedin");
    const portfolioEmailInput = document.getElementById("portfolioEmail");

    // Workspace
    const titleElement = document.getElementById("buildAgentProjectTitle");
    const progressLabel = document.getElementById("buildAgentProgressLabel");
    const progressBar = document.getElementById("buildAgentProgressBar");
    const progressFill = document.getElementById("buildAgentProgressFill");
    const planElement = document.getElementById("buildAgentPlan");
    const tasksElement = document.getElementById("buildAgentTasks");

    // AI editor
    const codeRequestInput = document.getElementById("buildAgentCodeRequest");
    const codeButton = document.getElementById("buildAgentCodeButton");
    const codeOutput = document.getElementById("buildAgentCodeOutput");
    const codeElement = document.getElementById("buildAgentCode");

    // Preview
    const runPreviewButton = document.getElementById("buildAgentRunButton");
    const stopPreviewButton = document.getElementById("buildAgentStopButton");
    const previewContainer = document.getElementById("buildAgentPreviewContainer");

    let previewFrame = document.getElementById("buildAgentPreview");

    // ==========================================
    // 2. VALIDATE HTML
    // ==========================================

    if (!form || !submitButton || !statusBox || !workspace) {
        console.error("Portfolio Studio: Required HTML elements are missing.");
        return;
    }

    if (!tasksElement) {
        console.warn("Portfolio Studio: buildAgentTasks element is missing.");
    }

    const API_URL = "https://skillforge-api-45.onrender.com/api/build-agent/projects";

    let currentProject = null;
    let isGenerating = false;
    let isEditingCode = false;
    let pendingEditRequest = "";

    // ==========================================
    // 3. AUTHENTICATION & API
    // ==========================================

    function getToken() {
        return localStorage.getItem("skillforgeToken");
    }

    async function apiRequest(url, options = {}) {
        const token = getToken();

        if (!token) {
            throw new Error("Login required. Please log in again.");
        }

        let response;

        try {
            response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {}),
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            throw new Error(
                "Could not connect to SkillForge AI server. " +
                "Please check that your backend is running."
            );
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const apiError = data.error;

            const errorMessage =
                (typeof apiError === "object" && apiError?.message) ||
                (typeof apiError === "string" && apiError) ||
                data.message ||
                `Request failed (${response.status}).`;

            if (
                response.status === 503 ||
                apiError?.status === "UNAVAILABLE"
            ) {
                throw new Error(
                    "Gemini is temporarily busy due to high demand. " +
                    "Your saved portfolio is safe. Please try again shortly."
                );
            }

            if (response.status === 429) {
                throw new Error(
                    "Gemini API rate limit reached. Please try again later."
                );
            }

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    "Your login session may have expired. Please log in again."
                );
            }

            throw new Error(errorMessage);
        }

        return data;
    }

    // ==========================================
    // 4. STATUS & RETRY
    // ==========================================

    function setStatus(message, isError = false) {
        statusBox.replaceChildren();
        statusBox.textContent = message;
        statusBox.style.color = isError ? "#ff7777" : "";
        statusBox.hidden = false;
        statusBox.setAttribute("role", "status");
    }

    function showRetry(message, retryCallback) {
        setStatus(message, true);

        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.textContent = "↻ Retry";
        retryButton.className = "primary-dashboard-button";
        retryButton.style.marginTop = "12px";

        retryButton.addEventListener("click", async () => {
            retryButton.disabled = true;
            retryButton.textContent = "Retrying...";

            try {
                await retryCallback();
            } catch (error) {
                console.error("Retry failed:", error);
            }
        });

        statusBox.appendChild(document.createElement("br"));
        statusBox.appendChild(retryButton);
    }
function isTemporaryGeminiError(error) {
    return /Gemini is temporarily busy/i.test(
        error?.message || ""
    );
}

    // ==========================================
    // 5. PORTFOLIO DATA
    // ==========================================

    function getSelectedPortfolioTheme() {
        return document.querySelector(
            'input[name="portfolioTheme"]:checked'
        )?.value || "modern-dark";
    }

    function buildPortfolioBrief() {
        const name = portfolioNameInput?.value.trim() || "";
        const role = portfolioRoleInput?.value.trim() || "";
        const bio = ideaInput?.value.trim() || "";
        const skills = portfolioSkillsInput?.value.trim() || "";
        const projects = portfolioProjectsInput?.value.trim() || "";
        const github = portfolioGithubInput?.value.trim() || "";
        const linkedin = portfolioLinkedinInput?.value.trim() || "";
        const email = portfolioEmailInput?.value.trim() || "";
        const theme = getSelectedPortfolioTheme();

        return `
PERSONAL DEVELOPER PORTFOLIO WEBSITE

PERSONAL INFORMATION:
Name: ${name}
Professional Role: ${role}

ABOUT ME:
${bio}

TECHNICAL SKILLS:
${skills || "Not provided"}

PROJECTS:
${projects || "No projects provided yet. Create a projects section with clearly marked placeholders."}

SOCIAL LINKS:
GitHub: ${github || "Not provided"}
LinkedIn: ${linkedin || "Not provided"}
Email: ${email || "Not provided"}

SELECTED DESIGN THEME:
${theme}

REQUIREMENTS:
1. Create a complete professional personal portfolio website.
2. Include Hero, About, Skills, Projects and Contact sections.
3. Use the actual personal information supplied above.
4. Do not invent work experience, achievements or project links.
5. Use clearly marked placeholders for information not provided.
6. Add working navigation and social links where available.
7. Add smooth scrolling and subtle animations.
8. Make the design responsive on mobile, tablet and desktop.
9. Use modern typography, spacing and professional layouts.
10. Include all CSS and JavaScript inside the HTML document.
11. Return the complete HTML document, not partial code.
12. Do not wrap the HTML in Markdown code fences.
`;
    }

    function buildInitialGenerationRequest() {
        return `
Create my complete professional developer portfolio website.

Use all the personal information, skills, projects, social links and design theme
provided in the project description.

Selected theme: ${getSelectedPortfolioTheme()}

The portfolio must have:
- Professional hero section
- About me section
- Skills section
- Project showcase with attractive cards
- Contact section
- Responsive navigation
- Footer
- Mobile responsive layout
- Smooth scrolling and subtle animations

Use actual supplied information. Do not invent qualifications or achievements.

Return a complete working HTML document with embedded CSS and JavaScript.
`;
    }

    // ==========================================
    // 6. PROGRESS TRACKING
    // ==========================================

    function calculateProgress(project) {
        const tasks = Array.isArray(project?.tasks)
            ? project.tasks
            : [];

        if (!tasks.length) return 0;

        const completed = tasks.filter(
            task => task.completed
        ).length;

        return Math.round((completed / tasks.length) * 100);
    }

    function updateProgress(project) {
        const progress = calculateProgress(project);

        if (progressLabel) {
            progressLabel.textContent = `${progress}% completed`;
        }

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressBar) {
            progressBar.setAttribute("aria-valuenow", String(progress));
        }
    }

    // ==========================================
    // 7. PREVIEW CONTROLS
    // ==========================================

    function stopPreview() {
        if (previewFrame) {
            previewFrame.onload = null;
            previewFrame.onerror = null;
            previewFrame.srcdoc = "";
        }

        if (previewContainer) {
            previewContainer.hidden = true;
            previewContainer.style.display = "none";
        }
    }

    function extractHTML(rawCode) {
        if (!rawCode || typeof rawCode !== "string") {
            throw new Error("No generated portfolio code is available.");
        }

        let source = rawCode.trim();

        source = source.replace(/^```(?:html|htm)?\s*/i, "");
        source = source.replace(/\s*```\s*$/i, "");

        const htmlStart = source.search(
            /<!doctype\s+html|<html(?:\s|>)/i
        );

        if (htmlStart === -1) {
            throw new Error("Complete HTML document was not found.");
        }

        source = source.slice(htmlStart);

        const closingTagIndex = source.toLowerCase().lastIndexOf("</html>");

        if (closingTagIndex !== -1) {
            source = source.slice(
                0,
                closingTagIndex + "</html>".length
            );
        }

        if (!/<html(?:\s|>)/i.test(source)) {
            throw new Error("HTML document is incomplete.");
        }

        if (!/<body(?:\s|>)/i.test(source)) {
            throw new Error("Generated HTML is missing its body.");
        }

        if (!/<\/html\s*>/i.test(source)) {
            throw new Error("Generated HTML is missing its closing tag.");
        }

        return source;
    }

    function runPreview() {
        const rawCode = codeElement?.textContent?.trim();

        if (!rawCode) {
            setStatus("Generate your portfolio first, then preview it.", true);
            return;
        }

        if (!previewContainer || !previewFrame) {
            setStatus("Portfolio preview elements are missing.", true);
            return;
        }

        let html;

        try {
            html = extractHTML(rawCode);
        } catch (error) {
            setStatus(error.message, true);
            return;
        }

        const previewStyles = `
<style id="skillforge-preview-defaults">
    html { min-height: 100%; }
    body {
        min-height: 100vh;
        margin: 0;
        box-sizing: border-box;
    }
    img {
        max-width: 100%;
        height: auto;
    }
</style>`;

        if (/<head(?:\s[^>]*)?>/i.test(html)) {
            html = html.replace(
                /<head(?:\s[^>]*)?>/i,
                match => match + previewStyles
            );
        } else {
            html = html.replace(
                /<html(?:\s[^>]*)?>/i,
                match => match + `<head>${previewStyles}</head>`
            );
        }

        previewContainer.hidden = false;
        previewContainer.style.display = "block";
        previewContainer.style.visibility = "visible";

        const freshFrame = document.createElement("iframe");

        freshFrame.id = "buildAgentPreview";
        freshFrame.title = "Portfolio Website Preview";
        freshFrame.setAttribute("sandbox", "allow-scripts");

        freshFrame.style.cssText = `
            display: block;
            width: 100%;
            height: 550px;
            min-height: 450px;
            border: 1px solid #444;
            border-radius: 12px;
            background: #ffffff;
        `;

        previewFrame.replaceWith(freshFrame);
        previewFrame = freshFrame;

        freshFrame.onload = () => {
            console.log("Portfolio preview loaded.");
            setStatus("Portfolio preview loaded successfully.");
        };

        freshFrame.onerror = () => {
            setStatus("Portfolio preview failed to load.", true);
        };

        freshFrame.srcdoc = html;

        setStatus("Loading your portfolio preview...");

        requestAnimationFrame(() => {
            previewContainer.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }

    // ==========================================
    // 8. TASK RENDERING
    // ==========================================

    function renderTasks(project) {
        if (!tasksElement) {
            console.warn("Portfolio Studio: Tasks element is missing.");
            return;
        }

        tasksElement.replaceChildren();

        const tasks = Array.isArray(project?.tasks)
            ? project.tasks
            : [];

        if (!tasks.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No portfolio tasks were generated.";
            tasksElement.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((task, index) => {
            const taskCard = document.createElement("div");
            taskCard.className = "build-agent-task";

            const taskLabel = document.createElement("label");
            taskLabel.className = "build-agent-task-label";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(task.completed);

            checkbox.setAttribute(
                "aria-label",
                `Mark ${task.title || "task"} complete`
            );

            const taskContent = document.createElement("div");
            taskContent.className = "build-agent-task-content";

            const taskTitle = document.createElement("strong");
            taskTitle.textContent =
                `${index + 1}. ${task.title || "Untitled task"}`;

            const taskDescription = document.createElement("p");
            taskDescription.textContent = task.description || "";

            taskContent.append(taskTitle, taskDescription);
            taskLabel.append(checkbox, taskContent);
            taskCard.appendChild(taskLabel);

            if (task.completed) {
                taskCard.classList.add("completed");
            }

            checkbox.addEventListener("change", async () => {
                if (!currentProject?._id || !task._id) {
                    checkbox.checked = Boolean(task.completed);

                    setStatus(
                        "Task ID is missing. Please reload the project.",
                        true
                    );
                    return;
                }

                const requestedState = checkbox.checked;
                checkbox.disabled = true;

                try {
                    const data = await apiRequest(
                        `${API_URL}/${currentProject._id}/tasks/${task._id}`,
                        {
                            method: "PATCH",
                            body: JSON.stringify({
                                completed: requestedState
                            })
                        }
                    );

                    if (!data.project) {
                        throw new Error("Updated project was not returned.");
                    }

                    renderProject(data.project);
                    setStatus("Portfolio task progress saved.");

                } catch (error) {
                    checkbox.checked = !requestedState;
                    checkbox.disabled = false;
                    setStatus(error.message, true);
                }
            });

            tasksElement.appendChild(taskCard);
        });
    }

    // ==========================================
    // 9. RENDER SAVED PROJECT
    // ==========================================

    function renderProject(project) {
        if (!project || typeof project !== "object") {
            setStatus("The server returned an invalid project.", true);
            return;
        }

        currentProject = project;
        // Restore the saved portfolio design theme
const savedIdea = project.idea || "";

const themeMatch = savedIdea.match(
    /SELECTED DESIGN THEME:\s*([^\r\n]+)/i
);

const savedTheme = themeMatch?.[1]?.trim();

const validThemes = [
    "modern-dark",
    "clean-light",
    "creative"
];

if (validThemes.includes(savedTheme)) {
    const savedThemeRadio = document.querySelector(
        `input[name="portfolioTheme"][value="${savedTheme}"]`
    );

    if (savedThemeRadio) {
        savedThemeRadio.checked = true;
    }
}

        workspace.hidden = false;
        workspace.style.display = "block";

        if (titleElement) {
            titleElement.textContent =
                project.title || "My Developer Portfolio";
        }

        if (planElement) {
            planElement.textContent =
                project.plan || "Your portfolio workspace is ready.";
        }

        const savedCode = project.generatedCode || project.code || "";

        if (savedCode && codeElement && codeOutput) {
            codeElement.textContent = savedCode;
            codeOutput.hidden = false;
            codeOutput.style.display = "block";
        } else if (codeElement && codeOutput) {
            codeElement.textContent = "";
            codeOutput.hidden = true;
            codeOutput.style.display = "none";
        }

        renderTasks(project);
        updateProgress(project);
        stopPreview();
    }

    // ==========================================
    // 10. GENERATE PORTFOLIO HTML
    // ==========================================

    async function generatePortfolioCode(projectId) {
        if (!projectId) {
            throw new Error("Portfolio project ID is missing.");
        }

        setStatus("Gemini is generating your portfolio website...");

        const codeData = await apiRequest(
            `${API_URL}/${projectId}/code`,
            {
                method: "POST",
                body: JSON.stringify({
                    request: buildInitialGenerationRequest()
                })
            }
        );

        if (!codeData.success || !codeData.code) {
            throw new Error(
                codeData.message || "Portfolio HTML was not returned."
            );
        }

        // Update the local project only after a successful response.
        currentProject.generatedCode = codeData.code;

        if (codeElement && codeOutput) {
            codeElement.textContent = codeData.code;
            codeOutput.hidden = false;
            codeOutput.style.display = "block";
        }

        setStatus(
            "Your portfolio website has been generated and saved successfully."
        );

        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // ==========================================
    // 11. CREATE PORTFOLIO PROJECT
    // ==========================================

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (isGenerating) return;

        const name = portfolioNameInput?.value.trim();
        const role = portfolioRoleInput?.value.trim();
        const bio = ideaInput?.value.trim();

        if (!name || !role || !bio) {
            setStatus(
                "Please enter your name, professional role and about section.",
                true
            );
            return;
        }

        if (!getToken()) {
            setStatus("Login required. Please log in again.", true);
            return;
        }

        isGenerating = true;
        submitButton.disabled = true;
        submitButton.textContent = "Creating your portfolio...";

        try {
            // First create and save the project workspace.
            setStatus("Creating your personal portfolio workspace...");

            const idea = buildPortfolioBrief();

            const skills = portfolioSkillsInput?.value.trim() || "";
            const existingTechnologies = techInput?.value.trim() || "";

            const technologies = [
                ...new Set(
                    `${existingTechnologies}, ${skills}`
                        .split(",")
                        .map(item => item.trim())
                        .filter(Boolean)
                )
            ].join(", ");

            const data = await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    idea,
                    duration: Number(daysInput?.value || 30),
                    level: levelInput?.value || "beginner",
                    technologies
                })
            });

            if (!data.success || !data.project) {
                throw new Error(
                    data.message || "The server did not return a project."
                );
            }

            renderProject(data.project);

            if (!currentProject?._id) {
                throw new Error("Project ID was not returned by the server.");
            }

            // Then generate the actual website code.
            await generatePortfolioCode(currentProject._id);

        } catch (error) {
            console.error("Portfolio generation error:", error);

            if (
                currentProject?._id &&
                isTemporaryGeminiError(error)
            ) {
                showRetry(
                    error.message,
                    async () => {
                        await generatePortfolioCode(currentProject._id);
                    }
                );
            } else {
                setStatus(
                    error.message || "Could not generate your portfolio.",
                    true
                );
            }

        } finally {
            isGenerating = false;
            submitButton.disabled = false;
            submitButton.textContent = "✦ Generate My Portfolio →";
        }
    });

    // ==========================================
    // 12. AI PORTFOLIO EDITOR
    // ==========================================

    async function editPortfolio(request) {
        if (!currentProject?._id) {
            throw new Error(
                "Create or load a portfolio before editing it."
            );
        }

        if (!request) {
            throw new Error("Please describe the changes you want.");
        }

        setStatus("Gemini is updating your existing portfolio...");

        const data = await apiRequest(
            `${API_URL}/${currentProject._id}/code`,
            {
                method: "POST",
                body: JSON.stringify({ request })
            }
        );

        if (!data.success || !data.code) {
            throw new Error(
                data.message || "Updated portfolio code was not returned."
            );
        }

        // Only replace existing code after successful generation.
        currentProject.generatedCode = data.code;

        if (codeElement && codeOutput) {
            codeElement.textContent = data.code;
            codeOutput.hidden = false;
            codeOutput.style.display = "block";
        }

        stopPreview();

        if (codeRequestInput) {
            codeRequestInput.value = "";
        }

        pendingEditRequest = "";

        setStatus(
            "Your portfolio has been updated and saved successfully."
        );

        codeOutput?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    if (codeButton) {
        codeButton.addEventListener("click", async () => {
            if (isEditingCode) return;

            if (!currentProject?._id) {
                setStatus(
                    "Create or load a portfolio before editing it.",
                    true
                );
                return;
            }

            const request =
                pendingEditRequest ||
                codeRequestInput?.value.trim() ||
                "";

            if (!request) {
                setStatus(
                    "Describe the changes you want in your portfolio.",
                    true
                );
                codeRequestInput?.focus();
                return;
            }

            pendingEditRequest = request;
            isEditingCode = true;
            codeButton.disabled = true;

            const originalText = codeButton.textContent;
            codeButton.textContent = "Updating your portfolio...";

            try {
                await editPortfolio(request);

            } catch (error) {
                console.error("Portfolio editing error:", error);

                if (isTemporaryGeminiError(error)) {
                    showRetry(
                        error.message,
                        async () => {
                            await editPortfolio(pendingEditRequest);
                        }
                    );
                } else {
                    setStatus(error.message, true);
                }

            } finally {
                isEditingCode = false;
                codeButton.disabled = false;
                codeButton.textContent =
                    originalText || "✦ Improve My Portfolio →";
            }
        });
    }

    // ==========================================
    // 13. PREVIEW BUTTONS
    // ==========================================

    if (runPreviewButton) {
        runPreviewButton.addEventListener("click", runPreview);
    }

    if (stopPreviewButton) {
        stopPreviewButton.addEventListener("click", () => {
            stopPreview();
            setStatus("Portfolio preview stopped.");
        });
    }

    // ==========================================
    // 14. LOAD SAVED PROJECT FROM MONGODB
    // ==========================================

    async function loadSavedProject() {
        try {
            const data = await apiRequest(API_URL, {
                method: "GET"
            });

            if (
                Array.isArray(data.projects) &&
                data.projects.length > 0
            ) {
                renderProject(data.projects[0]);

                setStatus(
                    "Your latest saved portfolio workspace has been loaded."
                );
            } else {
                currentProject = null;

                setStatus(
                    "Welcome to Portfolio Studio. Complete the form to create your portfolio."
                );
            }

        } catch (error) {
            console.warn("Saved portfolio load failed:", error);

            setStatus(
                error.message || "Could not load your saved portfolio.",
                true
            );
        }
    }

    // ==========================================
    // 15. INITIALIZE
    // ==========================================

    stopPreview();
    loadSavedProject();

    console.log("SkillForge AI Portfolio Studio initialized.");
}

// ==========================================
// START WHEN DOM IS READY
// ==========================================

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initBuildAgent,
        { once: true }
    );
} else {
    initBuildAgent();
}
