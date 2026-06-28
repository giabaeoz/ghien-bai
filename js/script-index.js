document.addEventListener("DOMContentLoaded", () => {
    // Init theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute("data-theme", "dark");
    }

    // Toggle logic
    const themeToggleBtn = document.getElementById("themeToggleHub");
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector(".theme-icon");
        
        // Sync initial icon
        if (document.documentElement.getAttribute("data-theme") === "dark") {
            icon.textContent = "☀️";
        } else {
            icon.textContent = "🌙";
        }

        themeToggleBtn.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            if (isDark) {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "light");
                icon.textContent = "🌙";
            } else {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
                icon.textContent = "☀️";
            }
        });
    }
});
