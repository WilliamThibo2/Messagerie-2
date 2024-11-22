const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authController = require('./controllers/authController');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');  // Import de Passport pour l'authentification Google
const User = require('./models/User'); // Assurez-vous que votre modèle User est bien défini

require('dotenv').config();
require('./config/passport')(passport); // Import de la configuration de Passport

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://messagerie2-1.onrender.com',
        methods: ['GET', 'POST'],
    },
});

connectDB();

// Middleware CORS
app.use(cors({
    origin: 'https://messagerie2-1.onrender.com',
    credentials: true,
}));

// Middleware pour les requêtes JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

const sessionMiddleware = session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // Cookie sécurisé en prod
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Middleware pour la gestion des sessions avec Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/chat', authController.verifyToken);

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route d'authentification Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback après l'authentification Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/chat'); // Redirection après connexion réussie
    }
);

// Route pour afficher la page de chat après la connexion
app.get('/chat', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    } else {
        res.redirect('/login'); // Si non authentifié, rediriger vers la page de login
    }
});

// Route d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/register.html'));
});

// Route pour supprimer un compte utilisateur
app.delete('/auth/deleteAccount', async (req, res) => {
    try {
        const userId = req.user.id; // Assurez-vous que l'utilisateur est connecté
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.json({ success: false, error: "Erreur lors de la suppression du compte." });
    }
});

// Gestion des connexions des utilisateurs avec Socket.IO
let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    // Rejoindre un utilisateur via un token JWT
    socket.on('join', ({ token }) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.request.session.userEmail = decoded.email;
            socket.request.session.save();
            connectedUsers[decoded.email] = socket.id;
            console.log(`${decoded.email} connecté avec l'ID ${socket.id}`);
        } catch (error) {
            console.log("Token invalide");
            socket.disconnect();
        }
    });

    // Envoi d'un message privé
    socket.on('private_message', ({ to, message }) => {
        const userEmail = socket.request.session.userEmail;
        if (userEmail) {
            const recipientSocket = connectedUsers[to];
            if (recipientSocket) {
                io.to(recipientSocket).emit('receive_message', { from: userEmail, message });
            }
        } else {
            console.log("Utilisateur non authentifié");
        }
    });

    // Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
        for (let email in connectedUsers) {
            if (connectedUsers[email] === socket.id) {
                delete connectedUsers[email];
                break;
            }
        }
    });
});

// Lancer le serveur
server.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
