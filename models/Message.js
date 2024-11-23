const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    to: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null  // Permet les messages de groupe
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    content: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 1000  // Limite la longueur du message
    },
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true  // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Message', MessageSchema);
