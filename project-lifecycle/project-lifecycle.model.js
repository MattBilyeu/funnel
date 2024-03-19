const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectLifecycleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Stage',
            required: false
        }
    ],
    prototype: {
        type: Boolean,
        required: true
    },
    notes: [{
        type: String,
        required: false
    }]
});

module.exports = mongoose.model('ProjectLifecycle', projectLifecycleSchema);