const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Vehicle = require('../db/models/vehicle.model');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, THIRTY_MINUTES_IN_MILLISECONDS, RIDE_STATUSES, UNLOCK_TYPES, VEHICLE_TYPES, VEHICLE_STATUSES, LENDER_STATUSES, DEFAULT_MAXIMUM_PICKUP_LOCATION_DISTANCE_IN_SEARCH } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const { vehiclePostValidation, vehicleUpdateValidation } = require('../validation/hapi');
const KeyService = require('../services/key.service');
const HelperFunctions = require('../helperFunctions/helperFunctions');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = vehiclePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
    if (!lender) return next(new ResponseError("You are not a lender", HTTP_STATUS_CODES.FORBIDDEN));

    try {
        const vehicle = new Vehicle(req.body);
        vehicle.lenderId = lender._id.toString();
        await DbService.create(COLLECTIONS.VEHICLES, vehicle);
        if (vehicle.type == VEHICLE_TYPES.CAR
            && Object.values(vehicle.unlockTypes).includes(UNLOCK_TYPES.AUTOMATIC)
            && !await KeyService.checkForExistingKey(vehicle._id))
            await KeyService.generateDefaultKey(vehicle._id);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid vehicle id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = vehicleUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (!req.isAdmin && req.body.status && req.body.status != VEHICLE_STATUSES.ACTIVE && req.body.status != VEHICLE_STATUSES.INACTIVE)
            return next(new ResponseError("Cannot update vehicle status to different values than active and inactive", HTTP_STATUS_CODES.CONFLICT));

        const vehicle = DbService.getById(COLLECTIONS.VEHICLES, req.params.id);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (!req.isAdmin && lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("You are not the owner of this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.VEHICLES, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);
        if (req.body.unlockTypes
            && vehicle.type == VEHICLE_TYPES.CAR
            && Object.values(req.body.unlockTypes).includes(UNLOCK_TYPES.AUTOMATIC)
            && !await KeyService.checkForExistingKey(vehicle._id))
            await KeyService.generateDefaultKey(vehicle._id);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/:id", async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid vehicle id", HTTP_STATUS_CODES.BAD_REQUEST))

    try {
        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, req.params.id);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        return res.status(HTTP_STATUS_CODES.OK).send({
            vehicle
        });
    } catch (err) {
        return next(new ResponseError(err.message || "Internal server error", err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/", authenticate, async (req, res, next) => {
    try {
        let vehicles = [];

        if (!req.isAdmin) {
            const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

            vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, { lenderId: mongoose.Types.ObjectId(lender._id) });
        }

        vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, {});

        return res.status(HTTP_STATUS_CODES.OK).send({
            vehicles
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid vehicle id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, req.params.id);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (!req.isAdmin && lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("You are not the owner of this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.delete(COLLECTIONS.VEHICLES, { _id: mongoose.Types.ObjectId(req.params.id) });
        await DbService.delete(COLLECTIONS.KEYS, { vehicleId: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/search", async (req, res, next) => {
    if (!req.query.lat || !req.query.lon) {
        return next(new ResponseError("Latitude and longitude must be provided", HTTP_STATUS_CODES.BAD_REQUEST));
    }

    try {
        let vehiclesForCheck = [];
        let vehicles = [];

        if (req.query.vehicleTypes) {
            for (let vehicleType in req.query.vehicleTypes) {
                if (!Object.values(VEHICLE_TYPES).includes(vehicleType)) return next(new ResponseError(`Vehicle type: ${vehicleType} not supported`, HTTP_STATUS_CODES.BAD_REQUEST));
            }
            for (let vehicleType in req.query.vehicleTypes) {
                vehicles.push(await DbService.getMany(COLLECTIONS.VEHICLES, { type: vehicleType }));
            }
        } else {
            vehicles = await DbService.getMany(COLLECTIONS.VEHICLES, {})
        }

        for (let vehicle of vehicles) {
            if (vehicle.status != VEHICLE_STATUSES.ACTIVE) continue;

            let distances = [];
            let canBeGot = true;

            const vehicleOwner = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
            if (!vehicleOwner || vehicleOwner.status != LENDER_STATUSES.ACTIVE) continue;
            Object.assign(vehicle, { user: user });

            const rides = await DbService.getMany(COLLECTIONS.RIDES, {
                vehicleId: mongoose.Types.ObjectId(vehicle._id),
                "$and": [
                    { status: { "$ne": RIDE_STATUSES.CANCELLED } },
                    { status: { "$ne": RIDE_STATUSES.FINISHED } },
                ]
            });

            for (let ride of rides) {
                if (!(new Date(req.query.pdt).getTime() - THIRTY_MINUTES_IN_MILLISECONDS > new Date(ride.plannedReturnDt).getTime())
                    && !(new Date(req.query.rdt).getTime() + THIRTY_MINUTES_IN_MILLISECONDS < new Date(ride.plannedPickupDt).getTime())) {
                    canBeGot = false;
                    break;
                }
            }

            if (canBeGot) {
                for (let pickupLocation of vehicle.pickupLocations) {
                    const distance = HelperFunctions.getDistanceBetweenTwoCoordinates(pickupLocation.lat, pickupLocation.lon, req.query.lat, req.query.lon);
                    distances.push(distance);
                }

                let shortestDistance = null;

                if (distances.length > 0) {
                    shortestDistance = distances[0];
                    for (let j = 0; j < distances.length; j++) {
                        if (distances[j] < shortestDistance) {
                            shortestDistance = distances[j];
                        }
                    }
                }

                Object.assign(vehicle, { distances: distances }, { shortestDistance: shortestDistance });

                if (shortestDistance && shortestDistance < DEFAULT_MAXIMUM_PICKUP_LOCATION_DISTANCE_IN_SEARCH)
                    vehiclesForCheck.push(vehicle)
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

        return res.status(HTTP_STATUS_CODES.OK).send({
            results: vehiclesForCheck
        })
    } catch (error) {
        return next(new ResponseError(error.message || "Internal server error", error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;