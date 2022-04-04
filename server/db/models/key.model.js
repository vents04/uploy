const mongoose = require('mongoose');
const { COLLECTIONS, DATABASE_MODELS } = require('../../global');

const keySchema = mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Key = mongoose.model(DATABASE_MODELS.KEY, keySchema);
module.exports = Key;