const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const post = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        reads: {
            type: Number,
            default: 0,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    {
        collection: 'blogposts',
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', post);