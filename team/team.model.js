const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
    stagesWorked: [{
        type: Schema.Types.ObjectId,
        ref: 'Stage',
        required: false
    }]
});

module.exports = mongoose.model('Team', teamSchema);