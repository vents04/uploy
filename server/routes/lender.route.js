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
    const { error } = signupValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existinglENDER = await DbService.getOne(COLLECTIONS.LENDERS, { userId: req.body.userId });
        if (existinglENDER) return next(new ResponseError("Lender with this email already exists", HTTP_STATUS_CODES.BAD_REQUEST));

        const lender = new Lender(req.body);
        await DbService.create(COLLECTIONS.LENDERS, lender);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});