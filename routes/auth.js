const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// Routes existantes
router.post('/register', register);
router.post('/login', login);

// Route de suppression de compte
router.delete("/deleteAccount", async (req, res) => {
    try {
        const userId = req.user?.id || req.session?.userId;
        if (!userId) {
            return res.status(400).json({ error: "Utilisateur non authentifié." });
        }
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.status(500).json({ success: false, error: "Erreur lors de la suppression du compte." });
    }
});

// Routes Google OAuth
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: false 
    }),
    (req, res) => {
        // Générer un token JWT
        const token = jwt.sign(
            { 
                id: req.user.id, 
                email: req.user.email 
            }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Redirection avec le token
        res.redirect(`/chat?token=${token}`);
    }
);

module.exports = router;
