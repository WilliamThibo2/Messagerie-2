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
        origin: 'https://messagerie-2.onrender.com/',
        methods: ['GET', 'POST'],
    },
});

connectDB();

// Middleware CORS
app.use(cors({
    origin: 'https://messagerie-2.onrender.com', // Assurez-vous que l'URL est correcte
    credentials: true, // Permet les cookies/session
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
app.use(express.static('public'));

// Middleware pour la gestion des sessions avec Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Stockage des informations utilisateur
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes pour les pages HTML
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.get('/', authController.verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Gestion des connexions des utilisateurs avec Socket.IO
let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion:', socket.id);

    // Ajouter l'utilisateur à connectedUsers après la connexion
    const userEmail = socket.user.email;
    connectedUsers[userEmail] = socket.id;
    console.log(`${userEmail} connecté avec l'ID ${socket.id}`);

    // Réception des messages privés
    socket.on('private_message', ({ to, message }) => {
        if (connectedUsers[userEmail]) {
            const recipientSocket = connectedUsers[to];
            if (recipientSocket) {
                io.to(recipientSocket).emit('receive_message', {
                    from: userEmail,
                    message,
                    timestamp: new Date().toISOString(),
                });
                console.log(`Message de ${userEmail} à ${to}: ${message}`);
            } else {
                console.log(`Destinataire ${to} non trouvé`);
            }
        } else {
            console.log("Utilisateur non authentifié");
        }
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
        for (const email in connectedUsers) {
            if (connectedUsers[email] === socket.id) {
                delete connectedUsers[email];
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT || 3000}`);
});
