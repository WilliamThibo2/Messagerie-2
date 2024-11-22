document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        themeToggle.innerHTML = body.classList.contains('dark') ? 
            '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
});
