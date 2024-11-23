const express = require('express');
const {
    createGroup,
    getUserGroups,
    sendGroupMessage,
    getGroupMessages,
} = require('../controllers/groupController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/create', authenticate, createGroup); // Créer un groupe
router.get('/', authenticate, getUserGroups); // Récupérer les groupes de l'utilisateur
router.post('/message', authenticate, sendGroupMessage); // Envoyer un message
router.get('/:groupId/messages', authenticate, getGroupMessages); // Récupérer les messages

module.exports = router;
