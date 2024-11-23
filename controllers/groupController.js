const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');

// Créer un groupe
exports.createGroup = async (req, res) => {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
        return res.status(400).json({ error: "Un groupe doit avoir un nom et au moins deux participants." });
    }

    try {
        const group = new Group({
            name,
            participants,
        });
        await group.save();

        res.status(201).json({ message: "Groupe créé avec succès", group });
    } catch (error) {
        console.error("Erreur lors de la création du groupe :", error);
        res.status(500).json({ error: "Erreur lors de la création du groupe." });
    }
};

// Récupérer les groupes de l'utilisateur connecté
exports.getUserGroups = async (req, res) => {
    try {
        const userGroups = await Group.find({ participants: req.user.id }).populate('participants', 'email');
        res.status(200).json({ groups: userGroups });
    } catch (error) {
        console.error("Erreur lors de la récupération des groupes :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des groupes." });
    }
};

// Envoyer un message dans un groupe
exports.sendGroupMessage = async (req, res) => {
    const { groupId, content } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Groupe introuvable." });
        }

        const message = new Message({
            from: req.user.id,
            to: null, // Pas de destinataire unique dans les groupes
            conversation: groupId,
            content,
        });
        await message.save();

        res.status(201).json({ message: "Message envoyé avec succès", data: message });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi du message." });
    }
};

// Récupérer les messages d'un groupe
exports.getGroupMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ conversation: groupId }).sort({ createdAt: 1 });
        res.status(200).json({ messages });
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des messages." });
    }
};
