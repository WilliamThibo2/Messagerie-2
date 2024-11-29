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
// Fonction pour envoyer un message privé à plusieurs destinataires
function sendMessage() {
    const toEmail = document.getElementById('toEmail').value.trim();
    const message = document.getElementById('message').value.trim();

    if (toEmail && message) {
        // Convertit la chaîne d'e-mails séparés par des virgules en un tableau
        const recipients = toEmail.split(',').map(email => email.trim()).filter(email => email);

        if (recipients.length === 0) {
            alert("Veuillez entrer au moins un destinataire valide.");
            return;
        }

        socket.emit('private_message', { to: recipients, message });

        // Ajouter le message envoyé dans l'interface
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
        alert("Veuillez entrer un message valide et au moins un destinataire.");
    }
}

let unreadMessages = 0;

socket.on('receive_message', ({ from, message, timestamp }) => {
    const messageElement = document.createElement("li");
    messageElement.classList.add("received-message");

    // Affiche une notification si l'utilisateur n'est pas visible
    if (document.visibilityState !== "visible") {
        unreadMessages++;
        document.title = `(${unreadMessages}) Messagerie`;

        if (Notification.permission === "granted") {
            new Notification(`Nouveau message de ${from}`, {
                body: message,
                icon: '/assets/icon/notif-messagerie.png',
                silent: true
            });
        }
        const notificationSound = document.getElementById('notificationSound');
        notificationSound.play().catch(error => console.warn("Impossible de jouer le son : ", error));
    }

    // Ajoute le message reçu dans l'interface
    const safeMessage = sanitizeHTML(message);
    const clickableMessage = makeLinksClickable(safeMessage);
    messageElement.innerHTML = `<strong>${from}:</strong> ${clickableMessage} <span class="message-date">${formatDate(timestamp)}</span>`;
    document.getElementById('messages').appendChild(messageElement);

    messageElement.style.animation = "fadeIn 0.3s ease-in-out";
});
function sanitizeHTML(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input; // Échapper les caractères spéciaux HTML
    return tempDiv.innerHTML;
}

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
    const category = tab.dataset.category;
    if (emojiCategories[category]) {
        emojiTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        emojiSearch.value = '';
        loadEmojis(category);
    } else {
        console.warn("Catégorie d'émojis invalide :", category);
    }
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
    // Regex pour capturer les URLs qui commencent par "http://", "https://", ou qui sont juste un nom de domaine
    const urlRegex = /(\b(?:https?:\/\/|www\.)[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})/g;

    return text.replace(urlRegex, (url) => {
        // Si l'URL ne commence pas par "http://" ou "https://", ajoute "http://"
        const fullUrl = /^https?:\/\//.test(url) ? url : 'http://' + url;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

document.getElementById('deleteAccountButton').addEventListener('click', function () {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
        // Envoi de la requête de suppression au serveur
        fetch('/delete-account', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Compte supprimé avec succès. Vous allez être redirigé.");
                localStorage.removeItem('token');
                window.location.href = '/register';
            } else {
                return response.json().then(data => {
                    alert(data.error || "Une erreur s'est produite lors de la suppression du compte.");
                });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la suppression du compte :", error);
            alert("Impossible de supprimer le compte pour le moment. Veuillez réessayer plus tard.");
        });
    }
});

// Demande de permission pour les notifications
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
            console.warn("Notifications désactivées par l'utilisateur.");
        }
    });
}

socket.on('typing', (data) => {
    const typingIndicator = document.getElementById('typing-indicator');
    const typingUser = document.getElementById('typing-user');

    if (data.typing) {
        typingIndicator.style.display = 'block';
        typingUser.textContent = `${data.user} est en train d'écrire...`;
    } else {
        typingIndicator.style.display = 'none';
    }
});

// Lorsque l'utilisateur commence à taper un message
const messageInput = document.getElementById('message-input'); // L'élément de saisie du message

messageInput.addEventListener('input', () => {
    socket.emit('typing', { user: 'Nom de l\'utilisateur', typing: true });

    // Vous pouvez également ajouter une logique pour arrêter l'indicateur après un certain délai
    setTimeout(() => {
        socket.emit('typing', { user: 'Nom de l\'utilisateur', typing: false });
    }, 1000); // Par exemple, après 1 seconde d'inactivité, l'indicateur disparaît
});

