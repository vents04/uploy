const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES } = require('../global');
const Lender = require('../db/models/generic/lender.model');
const { authenticate } = require('../middlewares/authenticate');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');
const { lenderPostValidation, updateLenderValidation } = require('../validation/hapi');

router.post("/", authenticate, async (req, res, next) => {
    const { error } = lenderPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingLender = await DbService.getOne(COLLECTIONS.LENDER, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingLender) return next(new ResponseError("Lender for this user has already been created", HTTP_STATUS_CODES.CONFLICT));

        const lender = new Lender(req.body);
        await DbService.create(COLLECTIONS.LENDER, lender);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", authenticate, async (req, res, next) => {
    const { error } = updateLenderValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const lender = await DbService.getOne(COLLECTIONS.LENDER, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!lender) return next(new ResponseError("Lender does not exists", HTTP_STATUS_CODES.NOT_FOUND));
        if (lender.status == LENDER_STATUSES.BLOCKED || lender.status == LENDER_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Cannot perform lender status update when lender status is pending approval or blocked", HTTP_STATUS_CODES.CONFLICT));
        if (req.body.status == LENDER_STATUSES.BLOCKED || req.body.status == LENDER_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Cannot perform lender status update with new status pending approval or blocked", HTTP_STATUS_CODES.BAD_REQUEST));

        await DbService.update(COLLECTIONS.LENDER, { userId: mongoose.Types.ObjectId(req.user._id) }, req.body);
    
        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;