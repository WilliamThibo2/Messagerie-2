const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Envoyer un message (privé ou de groupe)
exports.sendMessage = async (req, res) => {
    const { participants, to, content } = req.body; // "participants" pour groupe, "to" pour privé
    const from = req.userId;

    if ((!participants && !to) || !content) {
        return res.status(400).json({ error: "Participants ou destinataire et contenu requis." });
    }

    try {
        let conversation;

        // Si c'est une conversation de groupe
        if (participants) {
            if (participants.length < 2) {
                return res.status(400).json({ error: "Une conversation de groupe nécessite au moins deux participants." });
            }

            // Vérifiez si tous les participants existent
            const users = await User.find({ _id: { $in: participants } });
            if (users.length !== participants.length) {
                return res.status(404).json({ error: "Un ou plusieurs utilisateurs n'existent pas." });
            }

            // Trouvez ou créez une conversation de groupe
            conversation = await Conversation.findOne({
                participants: { $all: participants, $size: participants.length },
                type: 'group',
            });

            if (!conversation) {
                conversation = new Conversation({ participants, type: 'group' });
                await conversation.save();
            }
        }

        // Si c'est une conversation privée
        if (to) {
            const recipient = await User.findOne({ email: to });
            if (!recipient) {
                return res.status(404).json({ error: "Destinataire introuvable." });
            }

            // Trouvez ou créez une conversation privée
            conversation = await Conversation.findOne({
                participants: { $all: [from, recipient._id] },
                type: 'private',
            });

            if (!conversation) {
                conversation = new Conversation({ participants: [from, recipient._id], type: 'private' });
                await conversation.save();
            }
        }

        // Créez et enregistrez le message
        const message = new Message({
            from,
            to: to || null,
            conversation: conversation._id,
            content,
            type: conversation.type,
        });
        await message.save();

        // Mettez à jour le dernier message dans la conversation
        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json({ message: "Message envoyé avec succès", data: message });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

// Récupérer les messages d'une conversation
exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation introuvable." });
        }

        const messages = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .populate('from', 'email');

        res.json({ conversationId: conversation._id, messages });
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};

// Supprimer un message
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
