const mongoose = require('mongoose');
const { DATABASE_MODELS, KEY_ACTIONS } = require('../../global');

const vehicleActionSchema = mongoose.Schema({
    vehicleId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.VEHICLE,
        required: true
    }, 
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true
    },
    action: {
        type: String,
        enum: Object.values(KEY_ACTIONS),
        required: true
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const VehicleAction = mongoose.model(DATABASE_MODELS.VEHICLE_ACTION, vehicleActionSchema);
module.exports = VehicleAction;