const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '3b3d5fc7c8d783b549ce8ec7b8be105cc57c9da2b22e7df619f9a346b7936918426fccf7a615fa0bb52a7d16d8e57abbe88c98e776fbff96e886be8adda2d035';

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

// Routes Google OAuth (ajoutées)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

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
