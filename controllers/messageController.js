const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
    const { participants, content } = req.body; // Liste d'e-mails dans "participants"
    const from = req.userId;

    if (!participants || participants.length === 0 || !content) {
        return res.status(400).json({ error: "Participants et contenu requis." });
    }

    try {
        // Rechercher tous les utilisateurs correspondant aux e-mails
        const users = await User.find({ email: { $in: participants } });

        if (users.length !== participants.length) {
            return res.status(404).json({ error: "Un ou plusieurs destinataires sont introuvables." });
        }

        const participantIds = users.map(user => user._id);

        // Ajouter l'expéditeur dans la liste des participants (si ce n'est pas déjà inclus)
        if (!participantIds.includes(from)) {
            participantIds.push(from);
        }

        // Trouver ou créer une conversation
        let conversation = await Conversation.findOne({
            participants: { $all: participantIds, $size: participantIds.length },
            type: participantIds.length > 2 ? 'group' : 'private',
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: participantIds,
                type: participantIds.length > 2 ? 'group' : 'private',
            });
            await conversation.save();
        }

        // Créer le message
        const message = new Message({
            from,
            conversation: conversation._id,
            content,
            type: conversation.type,
        });
        await message.save();

        // Mettre à jour le dernier message dans la conversation
        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json({ message: "Message envoyé avec succès", data: message });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

exports.getMessages = async (req, res) => {
    const { userId } = req;
    const { conversationId } = req.params;

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(404).json({ error: "Conversation introuvable ou accès non autorisé." });
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
