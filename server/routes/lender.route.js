const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Lender = require('../db/models/lender.model');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const { lenderUpdateValidation } = require('../validation/hapi');
const StripeService = require('../services/stripe.service');
const StripeAccount = require('../db/models/stripeAccount.model');

router.post("/", authenticate, async (req, res, next) => {
    try {
        const existingLender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingLender) return next(new ResponseError("Lender for this user has already been created", HTTP_STATUS_CODES.CONFLICT));

        const lender = new Lender(req.body);
        await DbService.create(COLLECTIONS.LENDERS, lender);

        const account = await StripeService.createAccount(req.user);
        const stripeAccount = new StripeAccount({
            stripeAccountId: account.id,
            userId: req.user._id
        });
        await DbService.create(COLLECTIONS.STRIPE_ACCOUNTS, stripeAccount);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put("/:id", authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid lender id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = lenderUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (lender.status == LENDER_STATUSES.BLOCKED || lender.status == LENDER_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Cannot perform lender status update when lender status is pending approval or blocked", HTTP_STATUS_CODES.CONFLICT));
        if (req.body.status == LENDER_STATUSES.BLOCKED || req.body.status == LENDER_STATUSES.PENDING_APPROVAL)
            return next(new ResponseError("Cannot perform lender status update with new status being pending approval or blocked", HTTP_STATUS_CODES.BAD_REQUEST));

        await DbService.update(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;