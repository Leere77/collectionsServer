const Mongoose = require('mongoose');

const userSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 80,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 80,
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 80,
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
    collections: {
        own: {
            type: [Mongoose.ObjectId],
            default: [],
        },
        bookmarks: {
            type: [Mongoose.ObjectId],
            default: [],
        },
    },
    links: {
        type: [{
            type: String,
            maxlength: 100,
        }],
        default: [],
    },
});

module.exports = Mongoose.model('users', userSchema);