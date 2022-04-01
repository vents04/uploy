const express = require('express');
const mongoose = require('mongoose');
const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE } = require('../global');
const { signupValidation, loginValidation, userUpdateValidation } = require('../validation/hapi');
const User = require('../db/models/generic/user.model');
const Lender = require('../db/models/generic/lender.model');
const router = express.Router();

const { authenticate } = require('../middlewares/authenticate');

const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');
const AuthenticationService = require('../services/authentication.service');

router.post("/", async (req, res, next) => {
    const { error } = lenderValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existinglENDER = await DbService.getById(COLLECTIONS.LENDERS, req.user._id);
        if (existinglENDER) return next(new ResponseError("Lender with this id already exists", HTTP_STATUS_CODES.BAD_REQUEST));

        const lender = new Lender(req.body);
        await DbService.create(COLLECTIONS.LENDERS, lender);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/", async (req, res, next) => {
    const { error } = updateLenderValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const lender = await DbService.getById(COLLECTIONS.LENDERS, req.user._id);
        if (!lender) return next(new ResponseError("Lender with this id does not exists", HTTP_STATUS_CODES.BAD_REQUEST));

        await DbService.update(COLLECTIONS.LENDERS, { _id: mongoose.Types.ObjectId(req.user._id) }, {status: req.body.status});
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});