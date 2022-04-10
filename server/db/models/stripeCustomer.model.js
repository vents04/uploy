const mongoose = require('mongoose');
const { DATABASE_MODELS, STRIPE_CUSTOMER_STATUSES } = require('../../global');

const stripeCustomerSchema = mongoose.Schema({
    stripeCustomerId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: Object.values(STRIPE_CUSTOMER_STATUSES),
        default: STRIPE_CUSTOMER_STATUSES.ACTIVE
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const StripeCustomer = mongoose.model(DATABASE_MODELS.STRIPE_CUSTOMER, stripeCustomerSchema);
module.exports = StripeCustomer;