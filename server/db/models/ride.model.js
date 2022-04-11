const mongoose = require('mongoose');
const { DATABASE_MODELS, RIDE_STATUSES, CURRENCY_TYPES, UNLOCK_TYPES } = require('../../global');

const rideSchema = mongoose.Schema({
    vehicleId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.RIDE,
        required: true
    },
    price: {
        currency: {
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
    unlockType: {
        type: String,
        enum: Object.values(UNLOCK_TYPES),
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(RIDE_STATUSES),
        required: true
    },
    pickupLocation: {
        address: {
            type: String,
            minLength: 1,
            required: true
        },
        lat: {
            type: Number,
            min: -90,
            max: 90,
            required: true
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        }
    },
    returnLocation: {
        address: {
            type: String,
            minLength: 1,
            required: true
        },
        lat: {
            type: Number,
            min: -90,
            max: 90,
            required: true
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        }
    },
    plannedPickupDt: {
        type: Number,
        required: true
    },
    plannedReturnDt: {
        type: Number,
        required: true
    },
    actualPickupDt: {
        type: Number,
        default: null
    },
    actualReturnDt: {
        type: Number,
        default: null
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Ride = mongoose.model(DATABASE_MODELS.RIDE, rideSchema);
module.exports = Ride;