const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Envoyer un message privé dans une conversation
exports.sendMessage = async (req, res) => {
    const { to, content } = req.body; // "to" peut être une adresse email ou un ID utilisateur
    const from = req.userId;

    try {
        // Vérifiez si le destinataire existe
        const recipient = await User.findOne({ email: to });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable." });
        }

        // Rechercher ou créer une conversation entre l'expéditeur et le destinataire
        let conversation = await Conversation.findOne({
            participants: { $all: [from, recipient._id] }
        });

        if (!conversation) {
            // Créer une nouvelle conversation si elle n'existe pas
            conversation = new Conversation({ participants: [from, recipient._id] });
            await conversation.save();
        }

        // Créer et sauvegarder le message
        const message = new Message({
            from,
            to: recipient._id,
            conversation: conversation._id,
            text: content
        });
        await message.save();

        res.status(201).json({ message: "Message envoyé avec succès", data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

// Récupérer l'historique des messages d'une conversation
exports.getMessages = async (req, res) => {
    const { userId } = req;
    const { toEmail } = req.params;

    try {
        // Vérifiez si le destinataire existe
        const recipient = await User.findOne({ email: toEmail });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable." });
        }

        // Recherchez la conversation entre l'utilisateur connecté et le destinataire
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, recipient._id] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Aucune conversation trouvée avec ce destinataire." });
        }

        // Récupérez les messages de la conversation
        const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

        res.json({ conversationId: conversation._id, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};

// Récupérer les conversations de l'utilisateur
exports.getConversations = async (req, res) => {
    const { userId } = req;

    try {
        // Récupérez les conversations de l'utilisateur
        const conversations = await Conversation.find({ participants: userId }).populate('participants', 'email');

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des conversations." });
    }
};
