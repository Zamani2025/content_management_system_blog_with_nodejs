const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    title: {
        type: String,
        required: [true, 'Title field is required']
    },
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean
    },
    body: {
        type: String,
        required: [true, 'Description field is required']
    },
    file: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories"
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comments'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {usePushEach: true});


module.exports = mongoose.model('posts', PostSchema);