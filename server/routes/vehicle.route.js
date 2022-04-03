const express = require('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES, THIRTY_MINUTES_IN_MILLISECONDS, RIDE_STATUSES } = require('../global');
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

    const lender = await DbService.getOne(COLLECTIONS.LENDERS, {userId: mongoose.Types.ObjectId(req.user._id)});
    if(!lender || lender.status != LENDER_STATUSES.ACTIVE){
        return next(new ResponseError("You are not a lender or you have no been approved to be one yet. You can become one through the button in the home page.", HTTP_STATUS_CODES.NOT_FOUND));
    }
    try {
        const vehicle = new Vehicle(req.body);
        vehicle.lenderId = lender._id.toString();
        await DbService.create(COLLECTIONS.VEHICLES, vehicle);

        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", authenticate, async (req, res, next) => {
    const { error } = updateVehicleValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const vehicle = DbService.getOne(COLLECTIONS.VEHICLES, { lenderId: mongoose.Types.ObjectId(req.body.lenderId)});
        if(!vehicle){
            return next(new ResponseError("The vehicle you try to update was not found", HTTP_STATUS_CODES.NOT_FOUND));
        }
        await DbService.update(COLLECTIONS.VEHICLES, { lenderId: mongoose.Types.ObjectId(req.user._id) }, req.body);
        
        res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }

})

router.get("/search", async (req, res, next) => {
    if (!req.query.lat || !req.query.lon) {
        return next(new ResponseError("Both latitude and longitude must be provided", HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try {
        let shouldPush = true;
        let vehiclesForCheck= [];
        const vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, {})
        for (let vehicle of vehicles) {
            let distances = [];
            let canBeGot = true;
            for(let pickupLocation of vehicle.pickupLocations){
                let lat1 = pickupLocation.lat;
                let lat2 = req.query.lat;
                let lng1 = pickupLocation.lon;
                let lng2 = req.query.lon;

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

                const rides = await DbService.getMany(COLLECTIONS.RIDES, {vehicleId: mongoose.Types.ObjectId(req.body.vehicleId), "$and": [
                    {status: {"$ne": RIDE_STATUSES.CANCELLED}},
                    {status: {"$ne": RIDE_STATUSES.FINISHED}},
                ]});
    
                for(let ride of rides){
                    if(!(req.query.pdt - THIRTY_MINUTES_IN_MILLISECONDS > ride.plannedReturnDt) 
                    && !(req.query.rdt + THIRTY_MINUTES_IN_MILLISECONDS < ride.plannedPickupDt)){
                        canBeGot = false;
                    }
                }
                if(canBeGot){
                    const vehicleOwner = await DbService.getOne(COLLECTIONS.LENDERS, {_id: mongoose.Types.ObjectId(vehicle.lenderId)})
                    Object.assign(vehicle, {user: vehicleOwner});
                    distances.push(distance);
                    let shortestDistance = distances[0];
                    for(let j = 0; j < distances.length; j++){
                        if(distances[j] < shortestDistance){
                            shortestDistance = distances[j];
                        }
                    }
                    Object.assign(vehicle, {distances: distances}, {shortestDistance: shortestDistance})
                    if(shortestDistance < 20){
                        for (let j = 0; j < vehiclesForCheck.length; j++) {
                            if (vehiclesForCheck[j]._id.toString() == vehicle._id.toString()) {
                                shouldPush = false;
                                break;
                            }
                        }
                        if(shouldPush) vehiclesForCheck.push(vehicle)

                        shouldPush = true;
                    }
                }
            }
        }
        
        for (let i = 0; i < vehiclesForCheck.length; i++) {
            for (let j = 0; j < (vehiclesForCheck.length - i - 1); j++) {
                if (vehiclesForCheck[j].shortestDistance < vehiclesForCheck[j + 1].shortestDistance) {
                    var temp = vehiclesForCheck[j]
                    vehiclesForCheck[j] = vehiclesForCheck[j + 1]
                    vehiclesForCheck[j + 1] = temp
                }
            }
        }

        console.log(vehiclesForCheck)

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: vehiclesForCheck
        })
        

    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
})

module.exports = router;