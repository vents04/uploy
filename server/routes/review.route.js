const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const Review = require('../db/models/generic/review.model');
const { authenticate } = require('../middlewares/authenticate');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');
const { reviewValidation } = require('../validation/hapi');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = reviewValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getOne(COLLECTIONS.RIDES, { rideId: mongoose.Types.ObjectId(req.body.rideId) });
        if (!ride) return next(new ResponseError("A ride with this is does not exist", HTTP_STATUS_CODES.BAD_REQUEST));

        let userId = ride.userId;

        const vehicle = await DbService.getOne(COLLECTIONS.VEHICLES, { _id: mongoose.Types.ObjectId(ride.vehicleId) });
        if (!vehicle) return next(new ResponseError("The vehicle for this ride is non-existent", HTTP_STATUS_CODES.NOT_FOUND));


        let lenderId = vehicle.lenderId;

        if(req.user._id == userId || req.user._id == lenderId){
            const existingReview = await DbService.getOne(COLLECTIONS.REVIEW, { reviewerId: mongoose.Types.ObjectId(req.user._id) });
            if (existingReview) return next(new ResponseError("A review for this ride has already been created", HTTP_STATUS_CODES.CONFLICT));
        }else{
            return next(new ResponseError("You cannot create a review for this ride", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const review = new Review(req.body);
        await DbService.create(COLLECTIONS.REVIEWS, review);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});