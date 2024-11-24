// Récupère le token de l'URL et le stocke dans le localStorage si présent
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('token', token);
    // Retire le token de l'URL
    window.history.replaceState({}, document.title, "/");
}

// Vérifie si l'utilisateur est authentifié
const storedToken = localStorage.getItem('token');
if (!storedToken) {
    window.location.href = '/login';
} 

// Initialisation de la connexion Socket.IO avec le token
const socket = io({ query: { token: storedToken } });

// Gestion des erreurs de connexion
socket.on('connect_error', (err) => {
    console.error('Erreur de connexion Socket.IO:', err.message);
    alert('Erreur d\'authentification. Veuillez vous reconnecter.');
    localStorage.removeItem('token');
    window.location.href = '/login';
});

// Fonction pour formater la date en style "messagerie populaire"
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Hier, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    if (date > weekAgo) {
        return `${date.toLocaleDateString('fr-FR', { weekday: 'long' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Fonction pour envoyer un message privé
function sendMessage() {
    const toEmail = document.getElementById('toEmail').value.trim();
    const message = document.getElementById('message').value.trim();

    if (toEmail && message) {
        socket.emit('private_message', { to: toEmail, message });
        
        const messageElement = document.createElement("li");
        messageElement.classList.add("sent-message");
        const timestamp = new Date().toISOString();
        messageElement.innerHTML = `<strong>Vous:</strong> ${message} <span class="message-date">${formatDate(timestamp)}</span>`;
        document.getElementById('messages').appendChild(messageElement);

        messageElement.style.animation = "fadeIn 0.3s ease-in-out";
        document.getElementById('message').value = '';
    } else {
        alert("Veuillez entrer un message valide et un destinataire.");
    }
}

// Réception des messages privés de la part du serveur
socket.on('receive_message', ({ from, message, timestamp }) => {
    const messageElement = document.createElement("li");
    messageElement.classList.add("received-message");
    messageElement.innerHTML = `<strong>${from}:</strong> ${message} <span class="message-date">${formatDate(timestamp)}</span>`;
    document.getElementById('messages').appendChild(messageElement);

    messageElement.style.animation = "fadeIn 0.3s ease-in-out";
});

// Fonction de déconnexion
document.getElementById('signOutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    document.cookie.split(";").forEach(function(cookie) {
        const name = cookie.split("=")[0].trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    window.location.href = '/login';
});
// Définir les émojis par catégorie
// Définir les émojis par catégorie avec un suivi des utilisations
const emojiCategories = {
    smileys: [
        { emoji: '😀', usage: 0 }, { emoji: '😁', usage: 0 }, { emoji: '😂', usage: 0 },
        { emoji: '🤣', usage: 0 }, { emoji: '😃', usage: 0 }, { emoji: '😄', usage: 0 },
        // Ajoutez d'autres smileys ici...
    ],
    animals: [
        { emoji: '🐶', usage: 0 }, { emoji: '🐱', usage: 0 }, { emoji: '🐭', usage: 0 },
        // Ajoutez d'autres animaux ici...
    ],
    // Ajoutez d'autres catégories...
};

// Fonction pour initialiser le sélecteur d'émojis
function initializeEmojiPicker() {
    const emojiContent = document.getElementById('emojiContent');
    const emojiTabs = document.querySelectorAll('.emoji-tab');

    // Affiche les émojis de la première catégorie par défaut
    displayEmojis('smileys');

    // Gestion des clics sur les onglets
    emojiTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            displayEmojis(category);
        });
    });

    // Fonction pour afficher les émojis d'une catégorie
    function displayEmojis(category) {
        emojiContent.innerHTML = ''; // Réinitialise le contenu

        // Trie les émojis en fonction de leur usage (les plus utilisés en haut)
        const sortedEmojis = emojiCategories[category].sort((a, b) => b.usage - a.usage);

        sortedEmojis.forEach(({ emoji }) => {
            const emojiButton = document.createElement('button');
            emojiButton.classList.add('emoji-btn');
            emojiButton.textContent = emoji;

            // Ajoute un effet visuel au survol
            emojiButton.addEventListener('mouseenter', () => {
                emojiButton.style.transform = 'scale(1.2)';
                emojiButton.style.transition = 'transform 0.2s ease';
            });
            emojiButton.addEventListener('mouseleave', () => {
                emojiButton.style.transform = 'scale(1)';
            });

            // Gestion du clic sur un émoji
            emojiButton.addEventListener('click', () => {
                insertEmoji(emoji, category);
            });

            emojiContent.appendChild(emojiButton);
        });
    }

    // Fonction pour insérer un émoji dans la zone de texte et augmenter son compteur d'utilisation
    function insertEmoji(emoji, category) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value += emoji;
        messageInput.focus();

        // Augmente le compteur d'utilisation de l'émoji
        const emojiObject = emojiCategories[category].find(e => e.emoji === emoji);
        if (emojiObject) {
            emojiObject.usage++;
        }

        // Réaffiche les émojis pour mettre à jour l'ordre
        displayEmojis(category);
    }
}

// Initialisation du sélecteur d'émojis après chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeEmojiPicker();
});
