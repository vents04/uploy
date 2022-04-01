const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS, RIDE_STATUSES } = require('../../global');

const rideSchema = mongoose.Schema({
    vehicleId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.VEHICLES,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: COLLECTIONS.USERS,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(RIDE_STATUSES),
        default: RIDE_STATUSES.PENDING_APROVAL
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
        },
        required: true
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
        },
        required: true
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