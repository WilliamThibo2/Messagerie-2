const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Ajout de jwt pour générer un token JWT
const { register, login } = require('../controllers/authController');
const User = require('../models/User'); // Assure-toi que le modèle utilisateur est bien importé

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tonSecretPourLeToken'; // Défini une clé secrète

router.post('/register', register);
router.post('/login', login);

router.delete("/deleteAccount", async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.json({ success: false, error: "Erreur lors de la suppression du compte." });
    }
});

// Route pour l'authentification Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback après l'authentification Google
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        if (req.isAuthenticated()) {
            // Génère un token JWT pour l'utilisateur
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '1h' });
            // Redirige vers la page de chat avec le token
            res.redirect(`/chat?token=${token}`);
        } else {
            res.redirect('/login');
        }
    }
);

module.exports = router;
