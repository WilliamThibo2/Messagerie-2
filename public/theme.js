// Vérifie et applique le mode sombre dès le chargement
document.addEventListener("DOMContentLoaded", () => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        document.body.classList.add("dark");
    }
    updateToggleIcon();
});

// Sélecteur pour le bouton de bascule
const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateToggleIcon();
    });
}

// Met à jour l'icône en fonction du thème actif
function updateToggleIcon() {
    const themeToggle = document.querySelector(".theme-toggle");
    if (!themeToggle) return;

    themeToggle.innerHTML = document.body.classList.contains("dark")
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
}
