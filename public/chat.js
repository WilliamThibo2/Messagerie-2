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

        // Transforme les liens en cliquables
        const clickableMessage = makeLinksClickable(message);

        const timestamp = new Date().toISOString();
        messageElement.innerHTML = `<strong>Vous:</strong> ${clickableMessage} <span class="message-date">${formatDate(timestamp)}</span>`;
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

    // Sanitize and make links clickable
    const safeMessage = sanitizeHTML(message);
    const clickableMessage = makeLinksClickable(safeMessage);

    messageElement.innerHTML = `<strong>${from}:</strong> ${clickableMessage} <span class="message-date">${formatDate(timestamp)}</span>`;
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
// Liste complète des émojis par catégorie
const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘', '😋', '😎', '😜', '🤩', '😡', '😭', '😱', '😴'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐦', '🐤', '🦜', '🐍', '🐠', '🐙', '🦈'],
    food: ['🍎', '🍊', '🍇', '🍉', '🍓', '🍌', '🍍', '🥭', '🍑', '🍒', '🥝', '🍅', '🥑', '🥕', '🥔', '🍠', '🥒', '🥬', '🌽', '🍞', '🥐', '🥖', '🥯', '🥞', '🧀', '🍗', '🍖', '🥩', '🍤', '🍣', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍿', '🥤', '🍩', '🍪', '🎂', '🍰'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊', '🥋', '🛹', '⛸️', '🎣', '🎽', '🎿', '🏂', '🏌️‍♂️', '🏄‍♂️', '🏊‍♂️', '🤽‍♂️', '🚴‍♂️', '🚵‍♂️'],
    objects: ['📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💿', '📷', '📸', '📹', '🎥', '📺', '📻', '⏰', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🔨', '🪓', '🔧', '🪛', '🧰', '🔩', '🪙', '💸', '💳', '📦', '📬'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚪', '⚫', '🔶', '🔷', '🔺', '🔻', '🏳️', '🏴', '🏁', '🚩']
};

// Référence des éléments HTML
const emojiTabs = document.querySelectorAll('.emoji-tab');
const emojiContent = document.getElementById('emojiContent');
const emojiSearch = document.getElementById('emojiSearch');

// Fonction pour charger les émojis d'une catégorie
function loadEmojis(category) {
    emojiContent.innerHTML = ''; // Réinitialiser le contenu
    emojiCategories[category].forEach(emoji => {
        createEmojiButton(emoji);
    });
}

// Fonction pour créer un bouton d'émoji
function createEmojiButton(emoji) {
    const emojiButton = document.createElement('button');
    emojiButton.innerText = emoji;
    emojiButton.onclick = () => {
        document.getElementById('message').value += emoji;
        document.getElementById('emojiPicker').style.display = 'none';
    };
    emojiContent.appendChild(emojiButton);
}

// Filtrer les émojis en fonction de la recherche
emojiSearch.addEventListener('input', () => {
    const query = emojiSearch.value.toLowerCase();
    emojiContent.innerHTML = ''; // Réinitialiser le contenu
    for (const category in emojiCategories) {
        emojiCategories[category]
            .filter(emoji => emoji.includes(query))
            .forEach(createEmojiButton);
    }
});

// Ajoutez des événements aux onglets
emojiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        emojiTabs.forEach(t => t.classList.remove('active')); // Retirer les styles actifs
        tab.classList.add('active'); // Ajouter le style actif
        emojiSearch.value = ''; // Réinitialiser la barre de recherche
        loadEmojis(tab.dataset.category); // Charger les émojis
    });
});

// Afficher la première catégorie par défaut
document.addEventListener('DOMContentLoaded', () => {
    emojiTabs[0].classList.add('active');
    loadEmojis(emojiTabs[0].dataset.category);
});

// Bouton pour afficher/masquer le sélecteur
document.getElementById('emojiButton').addEventListener('click', () => {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Sélecteur du bouton
const darkModeToggle = document.getElementById('themeToggle');

// Vérifie l'état initial du mode sombre
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark-mode');
}

// Bascule entre le mode sombre et clair
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkModeActive = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkModeActive);
});

// Fonction pour détecter la touche "Entrée" dans le champ de message et envoyer le message
document.getElementById('message').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {  // Vérifie que Enter est pressé sans Shift
        event.preventDefault();  // Empêche l'ajout d'un saut de ligne
        sendMessage();  // Appelle la fonction pour envoyer le message
    }
});

// Fonction pour rendre les liens cliquables
function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Détecte les URLs commençant par http ou https
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}
