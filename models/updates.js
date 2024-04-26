const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: String,
    pHLevel: Number,
    ppm: Number,
    temp: Number
});

mongoose.model('Update', updateSchema);