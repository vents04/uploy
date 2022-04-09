const mongoose = require('mongoose');
const { DATABASE_MODELS, STRIPE_ACCOUNT_LINK_TYPES } = require('../../global');

const stripeAccountLinkSchema = mongoose.Schema({
    stripeAccountLink: {
        expires_at: {
            type: Number,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    stripeAccountLinkType: {
        type: String,
        enum: Object.values(STRIPE_ACCOUNT_LINK_TYPES),
        required: true
    },
    lenderId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.LENDER,
        required: true
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const StripeAccountLink = mongoose.model(DATABASE_MODELS.STRIPE_ACCOUNT_LINK, stripeAccountLinkSchema);
module.exports = StripeAccountLink;