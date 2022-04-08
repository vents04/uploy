const mongoose = require('mongoose');
const { DATABASE_MODELS, KEY_STATUSES } = require('../../global');

const keySchema = mongoose.Schema({
    vehicleId: {
        type: String,
        ref: DATABASE_MODELS.VEHICLE,
        required: true,
    },
    smartcarVehicleId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(KEY_STATUSES),
        default: KEY_STATUSES.PENDING_AUTH_FLOW
    },
    smartcarAccessResponse: {
        type: Object,
        default: {}
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

const Key = mongoose.model(DATABASE_MODELS.KEY, keySchema);
module.exports = Key;