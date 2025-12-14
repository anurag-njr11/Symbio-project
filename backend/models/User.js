const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.oauthProvider; // Password required only if not OAuth
        }
    },
    oauthProvider: {
        type: String,
        enum: ['google', 'microsoft', 'github', null],
        default: null
    },
    oauthId: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
