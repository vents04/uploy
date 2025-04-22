const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { authenticate } = require('../middlewares/authenticate');
const { driverLicensePostValidation, driverLicenseUpdateValidation } = require('../validation/hapi');
const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, DRIVER_LICENSE_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const DriverLicense = require('../db/models/driverLicense.model');
const ResponseError = require('../errors/responseError');
const DriverLicenseService = require('../services/driverLicense.service');

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

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

router.put("/:id", authenticate, async (req, res, next) => {
    if (!req.isAdmin) return next(new ResponseError("Only admins may update driver licenses", HTTP_STATUS_CODES.FORBIDDEN));

    const { error } = driverLicenseUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const driverLicense = await DbService.getById(COLLECTIONS.DRIVER_LICENSES, req.params.id);
        if (!driverLicense) return next(new ResponseError("Driver license not found", HTTP_STATUS_CODES.NOT_FOUND));

        await DbService.update(COLLECTIONS.DRIVER_LICENSES, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        if (req.body.status) {
            if (req.body.status == DRIVER_LICENSE_STATUSES.APPROVED) {
                await DriverLicenseService.addToDriverLicensesExpirationTimeouts(driverLicense._id, (req.body.expiryDt) ? req.body.expiryDt : driverLicense.expiryDt ? driverLicense.expiryDt : new Date().getTime())
            }
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/", authenticate, async (req, res, next) => {
    if (!req.isAdmin) return next(new ResponseError("Only admins may get driver licenses", HTTP_STATUS_CODES.FORBIDDEN));

    try {
        if (req.query.status) {
            if (!Object.values(DRIVER_LICENSE_STATUSES).includes(req.query.status))
                return next(new ResponseError("Invalid driver license status", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const driverLicenses = await DbService.getMany(COLLECTIONS.DRIVER_LICENSES, (req.query.status) ? { status: req.query.status } : {});

        return res.status(HTTP_STATUS_CODES.OK).send({
            driverLicenses
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;