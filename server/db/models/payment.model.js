const mongoose = require('mongoose');
const { DATABASE_MODELS, CURRENCY_TYPES, PAYMENT_STATUSES } = require('../../global');

const paymentSchema = mongoose.Schema({
    price: {
        currency:{
            type: String,
            enum: Object.values(CURRENCY_TYPES),
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUSES),
        default: PAYMENT_STATUSES.UNPAID
    }
});

const Payment = mongoose.model(DATABASE_MODELS.PAYMENT, paymentSchema);
module.exports = Payment;