// Appliquer le thème stocké au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Basculer le thème et synchroniser avec localStorage
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDarkMode = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', isDarkMode);
            themeToggle.innerHTML = isDarkMode ? 
                '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }
});
