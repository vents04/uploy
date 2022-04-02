const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, RIDE_STATUSES, CURRENCY_TYPES } = require('../../global');

const rideSchema = mongoose.Schema({
    vehicleId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.VEHICLES,
        required: true
    },
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
    userId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.USERS,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(RIDE_STATUSES),
        default: RIDE_STATUSES.PENDING_APPROVAL
    },
    pickupLocation: {
        address: {
            type: String,
            minLength: 1,
            maxLength: 1000,
        },
        lat: {
            type: Number,
            min: -90,
            max: 90,
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
        }
    },
    returnLocation: {
        address: {
            type: String,
            minLength: 1,
            maxLength: 1000,
        },
        lat: {
            type: Number,
            min: -90,
            max: 90,
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
        }
    },
    plannedPickupDt: { //Pickup date that is posted on the listing
        type: Number,
        required: true
    },
    plannedReturnDt: { //Return date that is posted on the listing
        type: Number,
        required: true
    },
    acPickupDt: { //Date for the exact moment when a person gets to a vehicle
        type: Number,
        default: null
    },
    acReturnDt: { //Date for the exact moment when a person returns a vehicle
        type: Number,
        default: null
    },
});

const Ride = mongoose.model(DATABASE_MODELS.RIDE, rideSchema);
module.exports = Ride;