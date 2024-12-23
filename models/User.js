const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String 
    }, // Peut être facultatif pour les utilisateurs Google
    googleId: { 
        type: String, 
        unique: true,
        sparse: true 
    },
    username: {
        type: String
    }
});

module.exports = mongoose.model('User', UserSchema);
