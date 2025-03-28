const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        }
    },
    {
        collections: 'blogcomments'
    },
    {
        timestamps: true
    },
);

module.exports = mongoose.model('Comment', comment);