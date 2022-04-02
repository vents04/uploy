const express = require('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES, THIRTY_MINUTES_IN_MILLISECONDS } = require('../global');
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
        let vehiclesForCheck= [];
        const vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, {})
        for (let vehicle of vehicles) {
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

            const rides = await DbService.getOne(COLLECTIONS.RIDES, {vehicleId: mongoose.Types.ObjectId(req.body.vehicleId), "$and": [
                {status: {"$ne": RIDE_STATUSES.CANCELLED}},
                {status: {"$ne": RIDE_STATUSES.FINISHED}},
            ]});

            for(let ride of rides){
                if(!(ride.plannedPickupDt - THIRTY_MINUTES_IN_MILLISECONDS > req.body.rdt) 
                || !(ride.plannedReturnDt + THIRTY_MINUTES_IN_MILLISECONDS < req.body.pdt)
                && distance > 20){
                    continue;
                }
            }

            Object.assign(vehicle, { distance: distance });
            vehiclesForCheck.push(vehicle);
        }

        for (let i = 0; i < vehiclesForCheck.length; i++) {
            for (let j = 0; j < (vehiclesForCheck.length - i - 1); j++) {
                if (vehiclesForCheck[j].distance < vehiclesForCheck[j + 1].distance) {
                    var temp = vehiclesForCheck[j]
                    vehiclesForCheck[j] = vehiclesForCheck[j + 1]
                    vehiclesForCheck[j + 1] = temp
                }
            }
        }

        for (let index = 0; index < vehiclesForCheck.length; index++) {
            let user = await DbService.getById(COLLECTIONS.USERS, vehiclesForCheck[index].userId.toString());
            // remove below line when in production
            if (!user) user = await DbService.getOne(COLLECTIONS.USERS, { _id: vehiclesForCheck[index].userId.toString() });
            if (!user) {
                vehiclesForCheck.splice(index, 1);
                index--;
                continue;
            }
            vehiclesForCheck[index].user = user;
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: vehiclesForCheck
        })
        

    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;