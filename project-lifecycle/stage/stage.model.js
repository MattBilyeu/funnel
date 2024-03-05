const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stageSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prototype: { // Used to indicate if this stage will be a model upon which new stages can be created.
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    claimedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

module.exports = mongoose.model('Stage', stageSchema);