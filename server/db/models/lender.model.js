const mongoose = require('mongoose');
const { COLLECTIONS, LENDER_STATUSES, DATABASE_MODELS } = require('../../global');

const lenderSchema = mongoose.Schema({
    lenderId: {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: COLLECTIONS.USERS,
            required: function() {return this.bussiness.length == 0}
        },
        bussinessId: {
            type: mongoose.Types.ObjectId,
            ref: COLLECTIONS.BUSSINESSES,
            required: function() {return this.userId.length == 0}
        }
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    status: {
        type: String,
        enum: Object.values(LENDER_STATUSES),
        default: LENDER_STATUSES.PENDING_APPROVAL,
    },
});

const Lender = mongoose.model(DATABASE_MODELS.LENDER, lenderSchema);
module.exports = Lender;