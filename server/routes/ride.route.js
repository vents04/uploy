const express = require("express");
const Ride = require("../db/models/ride.model");
const { COLLECTIONS, HTTP_STATUS_CODES, RIDE_STATUSES } = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const DbService = require("../services/db.service");
const { postRideValidation } = require("../validation/hapi");
const router = express.Router();

router.post('/', authenticate, async(req, res, next) => {
    const { error } = postRideValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, req.body.vehicleId);
        if(!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));
        if(vehicle.lenderId.toString() == req.user._id.toString()) return next(new ResponseError("Cannot rent your own vehicles", HTTP_STATUS_CODES.CONFLICT));

        const ride = new Ride(req.body);
        const rides = await DbService.getOne(COLLECTIONS.RIDES, {vehicleId: req.body.vehicleId, "$and": [
            {status: {"$ne": RIDE_STATUSES.CANCELLED}},
            {status: {"$ne": RIDE_STATUSES.FINISHED}},
        ]});

        for(let current of rides){
            if(current != ride){
                             
            }
        }
        ride.userId = req.user._id.toString();
        await DbService.create(COLLECTIONS.RIDES, ride);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;