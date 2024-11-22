const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tonSecretPourLeToken';

router.post('/register', register);
router.post('/login', login);

router.delete("/deleteAccount", async (req, res) => {
    try {
        const userId = req.user?.id || req.session?.userId; // Ajout d'une vérification plus robuste
        if (!userId) {
            return res.status(400).json({ error: "Utilisateur non authentifié." });
        }
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
    (req, res) => {
        if (req.isAuthenticated()) {
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET, { expiresIn: '1h' });
            res.redirect(`/chat?token=${token}`);
        } else {
            res.redirect('/login');
        }
    }
);

module.exports = router;
