const mongoose = require('mongoose');

const controlsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: String,
    rainwater: Boolean,
    deepwell: Boolean,
    reservoir: Boolean,
    phUp: Boolean,
    phDown: Boolean,
    nutrients: Boolean
});

mongoose.model('Control', controlsSchema);