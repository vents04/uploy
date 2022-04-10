const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../global');

const stripePaymentIntentSchema = mongoose.Schema({
    stripePaymentIntentId: {
        type: String,
        required: true
    },
    rideId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.RIDE,
        required: true,
        unique: true
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const StripePaymentIntent = mongoose.model(DATABASE_MODELS.STRIPE_PAYMENT_INTENT, stripePaymentIntentSchema);
module.exports = StripePaymentIntent;