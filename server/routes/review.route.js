const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Review = require('../db/models/review.model');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, DATABASE_MODELS } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const { reviewPostValidation } = require('../validation/hapi');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = reviewPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.body.rideId);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.BAD_REQUEST));
        
        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId );
        if(!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        let hasLeftReview = false;
        const reviewsForRide = await DbService.getMany(COLLECTIONS.REVIEWS, { rideId: mongoose.Types.ObjectId(req.body.rideId)});
        for (let review of reviewsForRide) {
            if (review.reviewerId.toString() == req.user._id.toString()){
                hasLeftReview = true;
            } else if (review.reviewerId.toString() == vehicle.lenderId.toString()) {
                hasLeftReview = true;
            }
        }

        if(hasLeftReview) {
            return next(new ResponseError("You have already left a review for this ride", HTTP_STATUS_CODES.CONFLICT));
        }

        const review = new Review(req.body);
        if(req.user._id.toString() == vehicle.lenderId.toString()) {
            review.reviewerId = vehicle.lenderId.toString();
            review.reviewerDatabaseModel = DATABASE_MODELS.LENDER;
        } else if (req.user._id.toString() == ride.userId.toString()) {
            review.reviewerId = ride.userId.toString();
            review.reviewerDatabaseModel = DATABASE_MODELS.USER;
        } else {
            return next(new ResponseError("You do not have permission to leave a review for this ride", HTTP_STATUS_CODES.FORBIDDEN));
        }

        await DbService.create(COLLECTIONS.REVIEWS, review);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;