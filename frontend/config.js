// ==========================================
// SkillForge AI - Global Configuration
// ==========================================

(function () {
    var DEFAULT_API_URL = "https://skillforge-api-45.onrender.com";
    var LOCAL_API_URL = "http://localhost:5000";

    var apiUrl = DEFAULT_API_URL;

    try {
        if (typeof localStorage !== "undefined" && localStorage.getItem("skillforgeApiMode") === "local") {
            apiUrl = LOCAL_API_URL;
        }
    } catch (e) {
        apiUrl = DEFAULT_API_URL;
    }

    window.SKILLFORGE_CONFIG = {
        API_URL: apiUrl,
        DEFAULT_API_URL: DEFAULT_API_URL,
        LOCAL_API_URL: LOCAL_API_URL,
        LOGIN_PAGE: "login.html",
        DASHBOARD_PAGE: "dashboard.html"
    };
})();
