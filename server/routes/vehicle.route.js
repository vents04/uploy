const express = require('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES } = require('../global');
const { postVehicleValidation, updateVehicleValidation } = require('../validation/hapi');
const Vehicle = require('../db/models/vehicle.model');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');

const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');
const AuthenticationService = require('../services/authentication.service');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = postVehicleValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, { "$or": [{lenderId: mongoose.Types.ObjectId(req.body.lenderId.userId)}, {lenderId: mongoose.Types.ObjectId(req.body.lenderId.bussinessId)}]});
    if(!lender && lender.status != LENDER_STATUSES.ACTIVE){
        return next(new ResponseError("Lender wasn't found or his status wasn't active", HTTP_STATUS_CODES.NOT_FOUND));
    }
    try {
        const vehicle = new Vehicle(req.body);
        await DbService.create(COLLECTIONS.VEHICLES, vehicle);

        res.status(HTTP_STATUS_CODES.OK);

    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", authenticate, async (req, res, next) => {
    const { error } = updateVehicleValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const vehicle = DbService.getOne(COLLECTIONS.VEHICLES, { "$or": [{lenderId: mongoose.Types.ObjectId(req.body.lenderId.userId)}, {lenderId: mongoose.Types.ObjectId(req.body.lenderId.bussinessId)}]});
        if(!vehicle){
            return next(new ResponseError("The vehicle you try to update was not found", HTTP_STATUS_CODES.NOT_FOUND));
        }
        await DbService.update(COLLECTIONS.VEHICLES, { lenderId: mongoose.Types.ObjectId(req.user._id) }, req.body);
        
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }

})

router.post("/vehicle/search", async (req, res, next) => {
    if (!req.body.lat || !req.body.lon) {
        return next(new ResponseError("Both latitude and longitude must be provided", HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try {
        let vehiclesForCheck, sorted = [];
        const vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, {})
        for (let vehicle of vehicles) {
            Object.assign(vehicle, { criteriasMet: 0 });
            let lat1 = vehicle.location.lat;
            let lat2 = req.body.lat;
            let lng1 = vehicle.location.lon;
            let lng2 = req.body.lom;

            lng1 = lng1 * Math.PI / 180;
            lng2 = lng2 * Math.PI / 180;

            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;

            let dlon = lng2 - lng1;
            let dlat = lat2 - lat1;
            let a = Math.pow(Math.sin(dlat / 2), 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.pow(Math.sin(dlon / 2), 2);

            let c = 2 * Math.asin(Math.sqrt(a));

            let radius = 6371;

            let distance = c * radius;
            Object.assign(vehicle, { distance: distance });
            if (distance > 20) {
                continue;
            }
            vehiclesForCheck[i].criteriasMet++;
            vehiclesForCheck.push(vehicle);
        }

        const reviews = await DbService.getMany(COLLECTIONS.REVIEWS, {});
        for (let i = 0; i < vehiclesForCheck.length; i++) {
            let sumOfAllRatings = 0, counter = 1;
            for (let review of reviews) {
                const vehicle = await DbService.getOne(COLLECTIONS.VEHICLES, {_id: mongoose.Types.ObjectId(review.vehicleId)});
                if (vehicle._id.toString() == vehiclesForCheck[i]._id.toString()) {
                    sumOfAllRatings += review.rating;
                    counter++;
                }
            }
            let overallRating = Number.parseFloat(sumOfAllRatings / counter).toFixed(1);
            if (overallRating < minRating) {
                continue;
            }
            vehiclesForCheck[i].criteriasMet++;

            Object.assign(vehiclesForCheck[i], { rating: overallRating });
        }

        for (let i = 0; i < vehiclesForCheck.length; i++) {
            if (vehiclesForCheck[i].distance <= 5
                && vehiclesForCheck[i].rating >= 3.5) {
                vehiclesForCheck[i].criteriasMet += 4
                sorted.push(vehiclesForCheck[i]);
                continue;
            }
            if (vehiclesForCheck[i].distance <= 5
                && vehiclesForCheck[i].rating < 3.5) {
                vehiclesForCheck[i].criteriasMet += 3
                sorted.push(vehiclesForCheck[i]);
                continue;
            }
            if (vehiclesForCheck[i].distance > 5
                && vehiclesForCheck[i].rating >= 3.5) {
                vehiclesForCheck[i].criteriasMet += 2;
                sorted.push(vehiclesForCheck[i]);
                continue;
            }
            if (vehiclesForCheck[i].distance > 5
                && vehiclesForCheck[i].rating < 3.5) {
                vehiclesForCheck[i].criteriasMet += 1;
                sorted.push(vehiclesForCheck[i]);
                continue;
            }
        }

        for (let i = 0; i < sorted.length; i++) {
            for (let j = 0; j < (sorted.length - i - 1); j++) {
                if (sorted[j].criteriasMet < sorted[j + 1].criteriasMet) {
                    var temp = sorted[j]
                    sorted[j] = sorted[j + 1]
                    sorted[j + 1] = temp
                }
            }
        }

        for (let index = 0; index < sorted.length; index++) {
            let user = await DbService.getById(COLLECTIONS.USERS, sorted[index].userId.toString());
            // remove below line when in production
            if (!user) user = await DbService.getOne(COLLECTIONS.USERS, { _id: sorted[index].userId.toString() });
            if (!user) {
                sorted.splice(index, 1);
                index--;
                continue;
            }
            sorted[index].user = user;
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: sorted
        })
        

    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;