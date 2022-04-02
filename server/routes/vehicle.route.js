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

router.post("/", async (req, res, next) => {
    const { error } = postVehicleValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, req.body.lenderId);
    if(!lender && lender.status != LENDER_STATUSES.ACTIVE){
        return next(new ResponseError("Lender wasn't found or his status wasn't active", HTTP_STATUS_CODES.BAD_REQUEST));
    }
    try {
        const vehicle = new Vehicle(req.body);
        await DbService.create(COLLECTIONS.VEHICLES, vehicle);

        res.status(HTTP_STATUS_CODES.OK);

    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;