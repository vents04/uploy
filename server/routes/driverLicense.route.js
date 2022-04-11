const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { authenticate } = require('../middlewares/authenticate');
const { driverLicensePostValidation } = require('../validation/hapi');
const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, DRIVER_LICENSE_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const DriverLicense = require('../db/models/driverLicense.model');
const ResponseError = require('../errors/responseError');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = driverLicensePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingDriverLicense = await DbService.getOne(COLLECTIONS.DRIVER_LICENSES, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingDriverLicense) {
            if (existingDriverLicense.status == DRIVER_LICENSE_STATUSES.PENDING_APPROVAL) return next(new ResponseError("Cannot submit driver license if you have a pending approval one currently", HTTP_STATUS_CODES.CONFLICT));
            await DbService.update(
                COLLECTIONS.DRIVER_LICENSES,
                { _id: mongoose.Types.ObjectId(existingDriverLicense._id) },
                {
                    photos: req.body.photos, vehicleTypes: [], status: DRIVER_LICENSE_STATUSES.PENDING_APPROVAL, createdDt: new Date().getTime()
                }
            );
            return res.sendStatus(HTTP_STATUS_CODES.OK);
        }

        const driverLicense = new DriverLicense(req.body);
        driverLicense.userId = req.user._id;
        await DbService.create(COLLECTIONS.DRIVER_LICENSES, driverLicense);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

module.exports = router;