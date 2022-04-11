const mongoose = require('mongoose');
const { DATABASE_MODELS, ADMIN_STATUSES } = require('../../global');

const adminSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: Object.values(ADMIN_STATUSES),
        default: ADMIN_STATUSES.ACTIVE
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Admin = mongoose.model(DATABASE_MODELS.ADMIN, adminSchema);
module.exports = Admin;