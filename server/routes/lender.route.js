const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Lender = require('../db/models/lender.model');
const ResponseError = require('../errors/responseError');
const DbService = require('../services/db.service');

const { HTTP_STATUS_CODES, COLLECTIONS, DEFAULT_ERROR_MESSAGE, LENDER_STATUSES, STRIPE_ACCOUNT_STATUSES, STRIPE_ACCOUNT_LINK_TYPES, ONBOARDING_CALLBACK_STATUSES } = require('../global');
const { authenticate } = require('../middlewares/authenticate');
const { lenderUpdateValidation } = require('../validation/hapi');
const StripeService = require('../services/stripe.service');
const StripeAccount = require('../db/models/stripeAccount.model');
const StripeAccountLink = require('../db/models/stripeAccountLink.model');

router.post("/", authenticate, async (req, res, next) => {
    try {
        const existingLender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (existingLender) return next(new ResponseError("Lender for this user has already been created", HTTP_STATUS_CODES.CONFLICT));

        const lender = new Lender({
            userId: req.user._id,
        });
        await DbService.create(COLLECTIONS.LENDERS, lender);

        const account = await StripeService.createAccount(req.user);
        const stripeAccount = new StripeAccount({
            stripeAccountId: account.id,
            lenderId: lender._id
        });
        await DbService.create(COLLECTIONS.STRIPE_ACCOUNTS, stripeAccount);

        return res.sendStatus(HTTP_STATUS_CODES.CREATED);
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

router.post("/stripe/account-link/:accountLinkType", authenticate, async (req, res, next) => {
    if (!Object.values(STRIPE_ACCOUNT_LINK_TYPES).includes(req.params.accountLinkType)) return next(new ResponseError("Invalid stripe account link type", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

        const stripeAccount = await DbService.getOne(COLLECTIONS.STRIPE_ACCOUNTS, { lenderId: mongoose.Types.ObjectId(lender._id) });
        if (!stripeAccount) return next(new ResponseError("Stripe account not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (stripeAccount.status == STRIPE_ACCOUNT_STATUSES.BLOCKED) return next(new ResponseError("You cannot create a stripe account onboarding link because we have blocked your stirpe account", HTTP_STATUS_CODES.CONFLICT));

        const accountLink = await StripeService.createAccountLink(stripeAccount.stripeAccountId, STRIPE_ACCOUNT_LINK_TYPES.ONBOARDING);
        const stripeAccountLink = new StripeAccountLink({
            stripeAccountLink: {
                expires_at: accountLink.expires_at,
                url: accountLink.url
            },
            stripeAccountLinkType: req.params.accountLinkType,
            lenderId: lender._id
        });
        await DbService.create(COLLECTIONS.STRIPE_ACCOUNT_LINKS, stripeAccountLink);

        return res.status(HTTP_STATUS_CODES.OK).send({
            stripeAccountLink: stripeAccountLink
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get("/stripe/account", authenticate, async (req, res, next) => {
    try {
        const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

        const stripeAccount = await DbService.getOne(COLLECTIONS.STRIPE_ACCOUNTS, { lenderId: mongoose.Types.ObjectId(lender._id) });
        if (!stripeAccount) return next(new ResponseError("Stripe account not found", HTTP_STATUS_CODES.NOT_FOUND));

        // check the value of the details_submitted property to know if the lender has completed the onboarding process
        const stripeAccountInstance = await StripeService.retrieveAccount(stripeAccount.stripeAccountId);

        return res.status(HTTP_STATUS_CODES.OK).send({
            stripeAccount: stripeAccount,
            stripeAccountInstance: stripeAccountInstance
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/stripe/onboarding/:state', async (req, res, next) => {
    if (!Object.values(ONBOARDING_CALLBACK_STATUSES).includes(req.params.state)) return next(new ResponseError("Invalid onboarding state", HTTP_STATUS_CODES.BAD_REQUEST));

    return res.status(HTTP_STATUS_CODES.OK).send(
        req.params.state == ONBOARDING_CALLBACK_STATUSES.SUCCESSFUL
            ? "Successfully created your stripe account. You may now get paid for your services"
            : "Unsuccessfully created your stripe account"
    )
});

module.exports = router;