const express = require('express');
const { createOrGetConversation, getConversationMessages } = require('../controllers/conversationController');
const { sendMessage, deleteMessage } = require('../controllers/messageController');  // Ajout de deleteMessage
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Route pour créer ou récupérer une conversation
router.post('/conversation', authenticate, createOrGetConversation);

// Route pour récupérer les messages d'une conversation
router.get('/conversation/:conversationId/messages', authenticate, getConversationMessages);

// Route pour envoyer un message (mise à jour pour inclure la conversation)
router.post('/send', authenticate, sendMessage);

// Route pour supprimer un message
router.delete('/message/:messageId', authenticate, deleteMessage);  // Ajout de la route de suppression

module.exports = router;
