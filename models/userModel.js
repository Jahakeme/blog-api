const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema ({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profile: {
        country: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        phoneNumber: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
    },
    role: {
        type: [String], 
        enum: ['admin', 'user'], // Restrict values to 'admin' or 'user'
        default: ['user'] // Set the default value to 'user'
    }
}, {
    collection: 'blog-users',
    timestamps: true
});

module.exports = mongoose.model('User', user);