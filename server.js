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
const passport = require('passport');

require('dotenv').config();
require('./config/passport')(passport);

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
    cookie: { secure: process.env.NODE_ENV === 'production' },
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

// Route pour afficher la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Route pour afficher la page de chat après la connexion
app.get('/chat', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    } else {
        res.redirect('/login');
    }
});

// Gestion des connexions des utilisateurs avec Socket.IO
let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

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

    socket.on('private_message', ({ to, message }) => {
        const userEmail = socket.request.session?.userEmail;
        if (userEmail) {
            const recipientSocket = connectedUsers[to];
            if (recipientSocket) {
                io.to(recipientSocket).emit('receive_message', { from: userEmail, message });
            }
        } else {
            console.log("Utilisateur non authentifié");
        }
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
        for (let email in connectedUsers) {
            if (connectedUsers[email] === socket.id) {
                delete connectedUsers[email];
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT || 3000}`);
});
