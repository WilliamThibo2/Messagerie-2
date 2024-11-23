const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
    const { to, content } = req.body;
    const from = req.userId;

    // Validation des données d'entrée
    if (!to || !content) {
        return res.status(400).json({ error: "Destinataire et contenu requis." });
    }

    try {
        // Vérifier si le destinataire existe
        const recipient = await User.findOne({ email: to });
        if (!recipient) {
            return res.status(404).json({ error: "Destinataire introuvable." });
        }

        // Rechercher ou créer une conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [from, recipient._id] }
        });

        if (!conversation) {
            conversation = new Conversation({ 
                participants: [from, recipient._id],
                type: 'private'
            });
            await conversation.save();
        }

        // Créer et sauvegarder le message
        const message = new Message({
            from,
            to: recipient._id,
            conversation: conversation._id,
            content,
            type: 'private'
        });
        await message.save();

        res.status(201).json({ 
            message: "Message envoyé avec succès", 
            data: message 
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

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
        const messages = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .populate('from', 'email');

        res.json({ conversationId: conversation._id, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};

exports.getConversations = async (req, res) => {
    const { userId } = req;

    try {
        // Récupérer les conversations où l'utilisateur est un participant
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'email')
            .lean();

        // Ajouter un aperçu du dernier message dans chaque conversation
        for (let conversation of conversations) {
            const lastMessage = await Message.findOne({ conversation: conversation._id })
                .sort({ createdAt: -1 })
                .lean();
            conversation.lastMessage = lastMessage ? lastMessage.content : "Pas encore de messages.";
        }

        res.status(200).json({ conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des conversations." });
    }
};
