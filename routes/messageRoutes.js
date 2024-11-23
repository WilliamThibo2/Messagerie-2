const express = require('express');
const { createOrGetConversation, getConversationMessages } = require('../controllers/conversationController');
const { sendMessage } = require('../controllers/messageController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Route pour créer ou récupérer une conversation
router.post('/conversation', authenticate, createOrGetConversation);

// Route pour récupérer les messages d'une conversation
router.get('/conversation/:conversationId/messages', authenticate, getConversationMessages);

// Route pour envoyer un message (mise à jour pour inclure la conversation)
router.post('/send', authenticate, sendMessage);

module.exports = router;
