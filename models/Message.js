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
        required: true,
        index: true  // Indexe pour améliorer les performances des requêtes
    },
    content: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 1000, 
        validate: {
            validator: function(v) {
                return v.trim().length > 0;  // Message non vide après suppression des espaces
            },
            message: 'Le message ne peut pas être vide.'
        }
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
