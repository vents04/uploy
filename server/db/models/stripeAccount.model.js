const mongoose = require('mongoose');
const { DATABASE_MODELS, STRIPE_ACCOUNT_STATUSES } = require('../../global');

const stripeAccountSchema = mongoose.Schema({
    stripeAccountId: {
        type: String,
        required: true
    },
    lenderId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: Object.values(STRIPE_ACCOUNT_STATUSES),
        default: STRIPE_ACCOUNT_STATUSES.ACTIVE
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const StripeAccount = mongoose.model(DATABASE_MODELS.STRIPE_ACCOUNT, stripeAccountSchema);
module.exports = StripeAccount;