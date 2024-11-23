const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    type: {
        type: String,
        enum: ['private', 'group'],
        default: 'private'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
