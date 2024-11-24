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
        const fromEmail = socket.user.email; // Assurez-vous que l'email de l'utilisateur est disponible
        socket.emit('private_message', { to: toEmail, message, from: fromEmail }); // Ajoutez l'expéditeur ici
        
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

// Fonction pour supprimer un message
function deleteMessage(messageId) {
    if (confirm("Voulez-vous vraiment supprimer ce message ?")) {
        fetch(`/message/${messageId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Supprime le message du DOM
                    const messageElement = document.getElementById(messageId);
                    if (messageElement) {
                        messageElement.remove();
                    }
                } else {
                    alert("Erreur lors de la suppression du message : " + data.error);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la requête de suppression :", error);
                alert("Erreur lors de la requête de suppression.");
            });
    }
}

// Réception des messages privés de la part du serveur
socket.on('receive_message', ({ _id, from, message, timestamp }) => {
    const messageElement = document.createElement("li");
    messageElement.id = _id;  // Utilise _id pour l'ID du message
    messageElement.classList.add("received-message");

    // Vérifiez si l'utilisateur connecté est l'expéditeur
    const isSender = from === socket.user.email; // Assurez-vous que `from` contient l'email ou l'ID de l'expéditeur

    messageElement.innerHTML = `
                <strong>${from}:</strong> ${message} 
        <span class="message-date">${formatDate(timestamp)}</span>
        ${isSender ? `<button class="delete-message-btn" onclick="deleteMessage('${_id}')">
            <i class="fas fa-trash"></i>
        </button>` : ''}
    `;    
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

// Fonction pour afficher/masquer le sélecteur d'émojis
document.getElementById('emojiButton').addEventListener('click', () => {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// Ajoute des émojis au sélecteur d'émojis
const emojis = ['😀', '😂', '😊', '😍', '😒', '👍', '❤️', '🔥', '🎉', '🙌'];
const emojiPicker = document.getElementById('emojiPicker');
emojis.forEach(emoji => {
    const emojiButton = document.createElement('button');
    emojiButton.classList.add('emoji');
    emojiButton.innerText = emoji;
    emojiButton.onclick = () => {
        document.getElementById('message').value += emoji;
        emojiPicker.style.display = 'none';
    };
    emojiPicker.appendChild(emojiButton);
});

// Fonction pour détecter la touche "Entrée" dans le champ de message
document.getElementById('message').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
