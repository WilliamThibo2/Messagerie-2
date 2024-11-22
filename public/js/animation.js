document.addEventListener("DOMContentLoaded", () => {
    // Animation au chargement
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
        authContainer.style.opacity = 0;
        authContainer.style.transform = 'translateY(30px)';
        setTimeout(() => {
            authContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            authContainer.style.opacity = 1;
            authContainer.style.transform = 'translateY(0)';
        }, 100);
    }

    // Animation des champs au focus
    const inputFields = document.querySelectorAll('.input-group input');
    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
            const parent = input.closest('.input-group');
            parent.style.transition = 'box-shadow 0.3s ease';
            parent.style.boxShadow = '0 0 10px rgba(110, 142, 251, 0.5)';
        });

        input.addEventListener('blur', () => {
            const parent = input.closest('.input-group');
            parent.style.boxShadow = 'none';
        });
    });

    // Bouton interactif au clic
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            submitButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                submitButton.style.transform = 'scale(1)';
            }, 200);
        });
    }
});
