const mongoose = require('mongoose');

const levelsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: String,
    rainwater: Number,
    deepwell: Number,
    reservoir: Number,
    phUp: Number,
    phDown: Number,
    nutrients: Number
});

mongoose.model('Level', levelsSchema);