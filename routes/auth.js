const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, verifyToken } = require('../controllers/authController'); // Importation des fonctions nécessaires
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// Routes d'inscription et de connexion
router.post('/register', register);
router.post('/login', login);

// Supprimer le compte d'un utilisateur (authentifié)
router.delete('/delete-account', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId; // ID utilisateur extrait depuis le token
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ message: "Compte supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        res.status(500).json({ error: "Une erreur s'est produite. Veuillez réessayer." });
    }
});

// Routes Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get(
    '/google/callback',
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
        res.redirect(`/?token=${token}`);
    }
);

module.exports = router;
