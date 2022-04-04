const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, RIDE_STATUSES, BUSINESS_STATUSES } = require('../../global');

const businessSchema = mongoose.Schema({
    uid: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true,
        unique: true
    },
    name: {
        type: String,
        minLength: 1,
        maxLength: 200,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PENDING_APPROVAL),
        default: BUSINESS_STATUSES.PENDING_APPROVAL
    },
    users: [{
        _id: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true
    }],
    phone: {
        type: String,
        minLength: 8,
        maxLength: 15,
        required: true,
    },
    email: {
        type: String,
        minLength: 3,
        maxLength: 320,
        required: true,
    }
});

const Business = mongoose.model(DATABASE_MODELS.BUSINESS, businessSchema);
module.exports = Business;