const mongoose = require('mongoose');
const { VEHICLE_STATUSES, CAR_MAKERS, VEHICLE_TYPES, UNLOCK_TYPES, CURRENCY_TYPES, SCOOTER_MAKERS, BIKE_MAKERS, COLLECTIONS, DATABASE_MODELS} = require('../../global');

const vehicleSchema = mongoose.Schema({
    lenderId: {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: COLLECTIONS.USERS,
            required: function() {return this.business.length == 0}
        },
        businessId: {
            type: mongoose.Types.ObjectId,
            ref: COLLECTIONS.BUSINESSES,
            required: function() {return this.userId.length == 0}
        }
    },
    title: {
        type: String,
        minLength: 1,
        maxLength: 100,
        required: true 
    },
    description: {
        type: String,
        minLength: 1,
        maxLength: 500,
        required: true
    },
    model: {
        type: String,
        minLength: 1,
        maxLength: 70, // the actual characters length of the longest car name + a bit more chars - Land Rover Range Rover Evoque 2.0 TD4 E-Capability 4x4 HSE Dynam
        required: true
    },
    maker: {
        type: String,
        enum: function(){
            switch(this.type) {
                case VEHICLE_TYPES.CAR:
                    return CAR_MAKERS;
                case VEHICLE_TYPES.SCOOTER:
                    return SCOOTER_MAKERS;
                case VEHICLE_TYPES.BIKE:
                    return BIKE_MAKERS;
            }
        },
        required: true
    },
    status: {
        type: String,
        enum: Object.values(VEHICLE_STATUSES),
        default: VEHICLE_STATUSES.ACTIVE
    },
    type: {
        type: String,
        enum: Object.values(VEHICLE_TYPES),
        required: true
    },
    seats: {
        type: Number,
        required: function(){
            return this.type && VEHICLE_TYPES.CAR
        },  
        minLength: 1,
        maxLength: 8,
    },
    smartCarKey: {
        type: String,
        required: true
    },
    pickupLocations: {
        address: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        } 
    },
    returnLocations: [{
        address: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        },
        lon: {
            type: Number,
            min: -180,
            max: 180,
            required: true
        } 
    }],
    unlockTypes: [{
        type: String,
        enum: Object.values(UNLOCK_TYPES),
        required: true
    }],
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
    }
})
const Vehicle = mongoose.model(DATABASE_MODELS.VEHICLE, vehicleSchema);
module.exports = Vehicle;