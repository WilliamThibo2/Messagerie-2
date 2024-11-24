const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
    const { to, content } = req.body;
    const from = req.userId;

    if (!to || !content) {
        return res.status(400).json({ error: "Destinataire et contenu requis." });
    }

    try {
        const recipient = await User.findOne({ email: to });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable." });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [from, recipient._id] }
        });

        if (!conversation) {
            conversation = new Conversation({ participants: [from, recipient._id], type: 'private' });
            await conversation.save();
        }

        const message = new Message({
            from,
            to: recipient._id,
            conversation: conversation._id,
            content,
            type: 'private'
        });
        await message.save();

        res.status(201).json({ message: "Message envoyé avec succès", data: message });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

exports.getMessages = async (req, res) => {
    const { userId } = req;
    const { toEmail } = req.params;

    try {
        const recipient = await User.findOne({ email: toEmail });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable." });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, recipient._id] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Aucune conversation trouvée avec ce destinataire." });
        }

        const messages = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .populate('from', 'email');

        res.json({ conversationId: conversation._id, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};

exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const { userId } = req;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message introuvable." });
        }

        if (message.from.toString() !== userId) {
            return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres messages." });
        }

        await message.deleteOne();
        res.status(200).json({ message: "Message supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
        res.status(500).json({ error: "Erreur lors de la suppression du message." });
    }
};
