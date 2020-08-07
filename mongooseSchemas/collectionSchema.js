const Mongoose = require('mongoose');

const collectionSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 80,
    },
    description: {
        type: String,
        default: '',
        maxlength: 140,
    },
    contentType: {
        type: String,
        required: true,
    },
    list: [{
        title: {
            type: String,
            required: true,
            maxlength: 80,
        },
        rated: {
            type: Number,
            default: null,
        },
        poster: String,
        author: String,
        year: Number,
    }],
    private: {
        type: Boolean,
        default: false,
    },
    anonymous: {
        type: Boolean,
        default: false,
    },
    ratedBy: [{
        type: Mongoose.ObjectId,
        default: null
    }],
    owner: {
        type: String,
        required: true
    }
});

module.exports = Mongoose.model('collections', collectionSchema);