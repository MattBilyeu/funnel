const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        required: false
    },
    resetExpiration: {
        type: Date,
        required: false
    },
    apiKey: {
        type: String,
        required: false
    },
    apiExp: {
        type: Date,
        required: false
    },
    lifecycles: [{
        type: Schema.Types.ObjectId,
        ref: 'ProjectLifecycle',
        required: false
    }]
});

module.exports = mongoose.model('User', userSchema);