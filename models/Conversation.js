const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Créer une conversation ou récupérer une existante
exports.createOrGetConversation = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Utilisateur cible non spécifié.' });
    }

    // Vérifier si une conversation entre les deux utilisateurs existe
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId] }
    });

    if (!conversation) {
      // Créer une nouvelle conversation
      conversation = new Conversation({
        participants: [currentUserId, userId]
      });
      await conversation.save();
    }

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création ou de la récupération de la conversation.' });
  }
};

// Obtenir les messages d'une conversation
exports.getConversationMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'email');

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
};
