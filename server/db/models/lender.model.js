const mongoose = require('mongoose');
const { DATABASE_MODELS, USER_STATUSES } = require('../../../global');
const { COLLECTIONS } = require('../../global');

const lenderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.USERS,
        required: true
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(LENDER_STATUSES),
        default: USER_STATUSES.PENDING_APROVAL,
    },
});

const User = mongoose.model(DATABASE_MODELS.USER, userSchema);
module.exports = User;