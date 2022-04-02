const mongoose = require('mongoose');
const { COLLECTIONS } = require('../../global');

const reviewSchema = mongoose.Schema({
    rideId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    reviwerId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        minLength: 1,
        maxLength: 5000,
        required: false
    },
});

const Review = mongoose.model(DATABASE_MODELS.REVIEW, reviewSchema);
module.exports = Review;