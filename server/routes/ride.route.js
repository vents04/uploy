const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Ride = require("../db/models/ride.model");
const ResponseError = require("../errors/responseError");
const DbService = require("../services/db.service");

const { COLLECTIONS, HTTP_STATUS_CODES, RIDE_STATUSES, THIRTY_MINUTES_IN_MILLISECONDS, VEHICLE_STATUSES } = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const { ridePostValidation, rideStatusUpdateValidation } = require("../validation/hapi");
const RideService = require("../services/ride.service");

router.post('/', authenticate, async (req, res, next) => {
    const { error } = ridePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, req.body.vehicleId);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (vehicle.status != VEHICLE_STATUSES.ACTIVE) return next(new ResponseError("Vehicle is not reservable", HTTP_STATUS_CODES.FORBIDDEN));
        if (!vehicle.unlockTypes.includes(req.body.unlockType)) return next(new ResponseError("Vehicle does not support this unlock type", HTTP_STATUS_CODES.BAD_REQUEST));

        const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
        if (lender.userId.toString() == req.user._id.toString()) {
            return next(new ResponseError("Cannot rent your own vehicles", HTTP_STATUS_CODES.CONFLICT));
        }

        if (new Date(req.body.plannedPickupDt).getTime() > new Date(req.body.plannedReturnDt).getTime()) {
            return next(new ResponseError("Return date cannot be before pickup date", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const rides = await DbService.getMany(COLLECTIONS.RIDES, {
            vehicleId: mongoose.Types.ObjectId(req.body.vehicleId), "$and": [
                { status: { "$ne": RIDE_STATUSES.CANCELLED } },
                { status: { "$ne": RIDE_STATUSES.FINISHED } },
            ]
        });

        for (let ride of rides) {
            if (!(new Date(req.body.plannedPickupDt).getTime() - THIRTY_MINUTES_IN_MILLISECONDS > new Date(ride.plannedReturnDt))
                && !(new Date(req.body.plannedReturnDt).getTime() + THIRTY_MINUTES_IN_MILLISECONDS < new Date(ride.plannedPickupDt))) {
                return next(new ResponseError("Vehicle is already scheduled for another ride during this period", HTTP_STATUS_CODES.CONFLICT));
            }
        }

        const ride = new Ride(req.body);
        ride.userId = req.user._id.toString();
        ride.status = RIDE_STATUSES.PENDING_APPROVAL;
        ride.plannedPickupDt = new Date(req.body.plannedPickupDt).getTime();
        ride.plannedReturnDt = new Date(req.body.plannedReturnDt).getTime();

        const calculatedPrice = parseFloat(((parseInt(ride.plannedReturnDt) - parseInt(ride.plannedPickupDt)) / (1000 * 60 * 60 * 24)) * vehicle.price.amount).toFixed(2)
        ride.price = {
            amount: calculatedPrice,
            currency: vehicle.price.currency
        }

        await DbService.create(COLLECTIONS.RIDES, ride);
        RideService.addRideToPendingApprovalTimeouts(ride._id, ride.plannedPickupDt);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (lender && ride.userId.toString() != req.user._id.toString()) {
            if (vehicle.lenderId.toString() != lender._id.toString()) {
                return next(new ResponseError("You are not allowed to get this ride", HTTP_STATUS_CODES.FORBIDDEN));
            }
        }
        ride.vehicle = vehicle;
        ride.isLender = ride.userId.toString() != req.user._id.toString();

        return res.status(HTTP_STATUS_CODES.OK).send({
            ride
        });
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { userId: mongoose.Types.ObjectId(req.user._id) });
        for (let ride of rides) {
            const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
            ride.vehicle = vehicle;
        }

        const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (lender) {
            const vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, { lenderId: mongoose.Types.ObjectId(lender._id) });
            for (let vehicle of vehicles) {
                const vehicleRides = await DbService.getMany(COLLECTIONS.RIDES, { vehicleId: mongoose.Types.ObjectId(vehicle._id) });
                for (let vehicleRide of vehicleRides) {
                    vehicleRide.vehicle = vehicle;
                }
                rides.push(...vehicleRides);
            }
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            rides
        });
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/client-update', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = rideStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (req.body.status != RIDE_STATUSES.ONGOING && ride.status != RIDE_STATUSES.AWAITING)
            return next(new ResponseError("Ride status cannot be changed", HTTP_STATUS_CODES.CONFLICT));
        if (req.user._id.toString() != ride.userId.toString()) return next(new ResponseError("You do not have permission to change the ride status", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
            status: req.body.status,
            acPickupDt: new Date().getTime()
        });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id/lender-update', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = rideStatusUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (req.body.status != RIDE_STATUSES.FINISHED && ride.status != RIDE_STATUSES.ONGOING)
            return next(new ResponseError("Ride status cannot be changed", HTTP_STATUS_CODES.CONFLICT));
        if (req.user._id.toString() != lender.userId.toString()) return next(new ResponseError("You do not have permission to change the ride status", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
            status: req.body.status,
            acReturnDt: new Date().getTime()
        });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;