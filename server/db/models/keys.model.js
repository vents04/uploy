const mongoose = require('mongoose');

const keySchema = mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Key = mongoose.model("Key", keySchema);
module.exports = Key;