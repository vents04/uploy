const mongoose = require('mongoose');
const { DATABASE_MODELS } = require('../../global');

const reviewSchema = mongoose.Schema({
    rideId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.RIDE,
        required: true
    },
    vehicleId: {
        type: mongoose.Types.ObjectId,
        ref: DATABASE_MODELS.VEHICLE,
        required: true
    },
    reviewerId: {
        type: mongoose.Types.ObjectId,
        ref: "reviewerDatabaseModel",
        required: true
    },
    reviewerDatabaseModel: {
        type: String,
        enum: [DATABASE_MODELS.USER, DATABASE_MODELS.LENDER],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    review: {
        type: String,
        minLength: 1,
        maxLength: 500,
    },
});

const Review = mongoose.model(DATABASE_MODELS.REVIEW, reviewSchema);
module.exports = Review;