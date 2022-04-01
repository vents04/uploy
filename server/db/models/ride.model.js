const mongoose = require('mongoose');
const { DATABASE_MODELS, COLLECTIONS } = require('../../global');

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
    pickUpLocation: {
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
        lng: {
            type: Number,
            min: -180,
            max: 180,
        }
        
    },
    returnLocation: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    plannedPickUpDt: { //Pickup date that is posted on the listing
        type: Number,
        default: Date.now
    },
    plannedReturnDt: { //Return date that is posted on the listing
        type: Number,
        default: Date.now
    },
    acPickUpDt: { //Date for the exact moment when a person gets to a vehicle
        type: Number,
        default: Date.now
    },
    acReturnDt: { //Date for the exact moment when a person returns a vehicle
        type: Number,
        default: Date.now
    },
});

const Ride = mongoose.model(DATABASE_MODELS.RIDE, rideSchema);
module.exports = Ride;