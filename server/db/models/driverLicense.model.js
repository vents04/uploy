const mongoose = require('mongoose');
const { DATABASE_MODELS, DRIVER_LICENSE_STATUSES } = require('../../global');

const driverLicenseSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.USER,
        required: true,
        unique: true
    },
    vehicleTypes: {
        type: [{
            type: String,
            required: true,
        }],
        default: [],
    },
    photos: {
        type: [{
            photo: {
                type: String,
                required: true,
            }
        }],
        default: [],
        validate: [photosSizeLimit, "Photos must have exactly 2 values"]
    },
    status: {
        type: String,
        enum: Object.values(DRIVER_LICENSE_STATUSES),
        default: DRIVER_LICENSE_STATUSES.PENDING_APPROVAL
    },
    createdDt: {
        type: Number,
        default: Date.now
    }
});

function photosSizeLimit(value) {
    return value.length == 2;
}

const DriverLicense = mongoose.model(DATABASE_MODELS.DRIVER_LICENSE, driverLicenseSchema);
module.exports = DriverLicense;