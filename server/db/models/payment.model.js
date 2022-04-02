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
            min: 1,
            required: true
        }
    },
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUSES),
        default: Object.values(PAYMENT_STATUSES.UNPAYED)
    }
});

const Payment = mongoose.model(DATABASE_MODELS.PAYMENT, paymentSchema);
module.exports = Payment;