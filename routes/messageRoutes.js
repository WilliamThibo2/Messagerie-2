const express = require('express');
const {
    sendMessage,
    getMessages,
    deleteMessage
} = require('../controllers/messageController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/messages/:toEmail', authenticate, getMessages);
router.delete('/message/:messageId', authenticate, deleteMessage);

module.exports = router;
