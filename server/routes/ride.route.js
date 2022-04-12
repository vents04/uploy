const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Ride = require("../db/models/ride.model");
const ResponseError = require("../errors/responseError");
const DbService = require("../services/db.service");

const { COLLECTIONS, HTTP_STATUS_CODES, RIDE_STATUSES, THIRTY_MINUTES_IN_MILLISECONDS, VEHICLE_STATUSES, STRIPE_ACCOUNT_STATUSES, STRIPE_WEBHOOK_SIGNING_SECRET, USER_STATUSES, STRIPE_CUSTOMER_STATUSES } = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const { ridePostValidation, rideRefundPostValidation, rideUpdateValidation } = require("../validation/hapi");
const RideService = require("../services/ride.service");
const StripeService = require("../services/stripe.service");
const StripePaymentIntent = require("../db/models/stripePaymentIntent.model");
const DriverLicenseService = require("../services/driverLicense.service");

router.post('/', authenticate, async (req, res, next) => {
    const { error } = ridePostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    let rideInstance = null;

    try {
        if (req.user.status == USER_STATUSES.BLOCKED) return next(new ResponseError("Cannot ride vehicles because your account is blocked", HTTP_STATUS_CODES.CONFLICT));

        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, req.body.vehicleId);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (vehicle.status != VEHICLE_STATUSES.ACTIVE) return next(new ResponseError("Vehicle is not reservable", HTTP_STATUS_CODES.FORBIDDEN));
        if (!Object.values(vehicle.unlockTypes).includes(req.body.unlockType)) return next(new ResponseError("Vehicle does not support this unlock type", HTTP_STATUS_CODES.BAD_REQUEST));

        let pickupLocationMatch = false;
        for (let pickupLocation of vehicle.pickupLocations) {
            if (req.body.pickupLocation.address == pickupLocation.address
                && req.body.pickupLocation.lat == pickupLocation.lat
                && req.body.pickupLocation.lon == pickupLocation.lon) {
                pickupLocationMatch = true;
            }
        }
        if (!pickupLocationMatch) return next(new ResponseError("Pickup location does not exist", HTTP_STATUS_CODES.BAD_REQUEST));

        let returnLocationMatch = false;
        for (let returnLocation of vehicle.returnLocations) {
            if (req.body.returnLocation.address == returnLocation.address
                && req.body.returnLocation.lat == returnLocation.lat
                && req.body.returnLocation.lon == returnLocation.lon) {
                returnLocationMatch = true;
            }
        }
        if (!returnLocationMatch) return next(new ResponseError("Return location does not exist", HTTP_STATUS_CODES.BAD_REQUEST));

        const canDriveVehicleType = await DriverLicenseService.canDriveVehicleType(vehicle.type, req.user._id);
        if (!canDriveVehicleType) return next(new ResponseError("You do not have an approved driver license document or it does not allow you to drive this vehicle", HTTP_STATUS_CODES.CONFLICT))

        const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
        if (lender.userId.toString() == req.user._id.toString()) {
            return next(new ResponseError("Cannot rent your own vehicles", HTTP_STATUS_CODES.CONFLICT));
        }

        if (new Date(req.body.plannedPickupDt).getTime() > new Date(req.body.plannedReturnDt).getTime()) {
            return next(new ResponseError("Return date cannot be before pickup date", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        if (new Date().getTime() + THIRTY_MINUTES_IN_MILLISECONDS >= new Date(req.body.plannedPickupDt).getTime()) {
            return next(new ResponseError("Pickup date and time must be at least 30 minutes ahead of now", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        if (new Date(req.body.plannedPickupDt).getTime() + THIRTY_MINUTES_IN_MILLISECONDS > new Date(req.body.plannedReturnDt).getTime()) {
            return next(new ResponseError("Minimum rental period is 30 minutes", HTTP_STATUS_CODES.BAD_REQUEST));
        }

        const rides = await DbService.getMany(COLLECTIONS.RIDES, {
            vehicleId: mongoose.Types.ObjectId(req.body.vehicleId), "$and": [
                { status: { "$ne": RIDE_STATUSES.CANCELLED } },
                { status: { "$ne": RIDE_STATUSES.FINISHED } },
            ]
        });


        // thirty minutes interval from now on to pickupdt check does not work
        for (let ride of rides) {
            if (ride.status != RIDE_STATUSES.CANCELLED && ride.status != RIDE_STATUSES.FINISHED && ride.status != RIDE_STATUSES.CANCELLED_BY_SYSTEM)
                if (!(new Date(req.body.plannedPickupDt).getTime() - THIRTY_MINUTES_IN_MILLISECONDS > new Date(ride.plannedReturnDt))
                    && !(new Date(req.body.plannedReturnDt).getTime() + THIRTY_MINUTES_IN_MILLISECONDS < new Date(ride.plannedPickupDt))) {
                    return next(new ResponseError("Vehicle is already scheduled for another ride during this period", HTTP_STATUS_CODES.CONFLICT));
                }
        }

        const ride = new Ride(req.body);
        ride.userId = req.user._id.toString();
        ride.status = RIDE_STATUSES.AWAITING_PAYMENT;
        ride.plannedPickupDt = new Date(req.body.plannedPickupDt).getTime();
        ride.plannedReturnDt = new Date(req.body.plannedReturnDt).getTime();

        const calculatedPrice =
            parseFloat(((parseInt(new Date(ride.plannedReturnDt).getTime()) - parseInt(new Date(ride.plannedPickupDt).getTime())) / (1000 * 60 * 60 * 24)) * vehicle.price.amount).toFixed(2) >= 1
                ? parseFloat(((parseInt(new Date(ride.plannedReturnDt).getTime()) - parseInt(new Date(ride.plannedPickupDt).getTime())) / (1000 * 60 * 60 * 24)) * vehicle.price.amount).toFixed(2)
                : 1
        ride.price = {
            amount: calculatedPrice,
            currency: vehicle.price.currency
        }
        ride.currentVehicleInstance = vehicle;
        const lenderUserInstance = await DbService.getById(COLLECTIONS.USERS, lender.userId);
        ride.currentLenderUserInstance = lenderUserInstance;
        ride.currentRiderUserInstance = req.user;

        const stripeAccount = await DbService.getOne(COLLECTIONS.STRIPE_ACCOUNTS, { lenderId: mongoose.Types.ObjectId(lender._id) });
        const stripeCustomer = await DbService.getOne(COLLECTIONS.STRIPE_CUSTOMERS, { userId: mongoose.Types.ObjectId(req.user._id) });
        if (!stripeAccount || stripeAccount.status != STRIPE_ACCOUNT_STATUSES.ACTIVE) {
            return next(new ResponseError("Ride not saved. Cannot create checkout for this ride because we could not find the lender's Stripe account or it is blocked", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
        }
        if (!stripeCustomer || stripCustomer.status != STRIPE_CUSTOMER_STATUSES.ACTIVE) {
            return next(new ResponseError("Ride not saved. Cannot create checkout for this ride because we could not find your Stripe customer instance or it is blocked", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
        }

        await DbService.create(COLLECTIONS.RIDES, ride);
        rideInstance = ride;
        RideService.addRideToAwaitingPaymentTimeouts(ride._id, ride.createdDt);

        const paymentIntent = await StripeService.createPaymentIntent(ride.price.amount * 100, ride.price.currency, stripeAccount.stripeAccountId, stripeCustomer.stripeCustomerId)
        const stripePaymentIntent = new StripePaymentIntent({
            stripePaymentIntentId: paymentIntent.id,
            rideId: ride._id
        });
        await DbService.create(COLLECTIONS.STRIPE_PAYMENT_INTENTS, stripePaymentIntent);

        return res.status(HTTP_STATUS_CODES.CREATED).send({
            paymentIntentClientSecret: paymentIntent.client_secret
        });
    } catch (e) {
        if (rideInstance) await RideService.cancelRide(rideInstance._id);
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/:id/payment-intent', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST))

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (!req.isAdmin && ride.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot get the payment intent for this ride", HTTP_STATUS_CODES.FORBIDDEN));
        if (ride.status != RIDE_STATUSES.AWAITING_PAYMENT) return next(new ResponseError("Cannot get the payment intent for rides in statuses different than awaiting payment", HTTP_STATUS_CODES.CONFLICT));

        const stripePaymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { rideId: mongoose.Types.ObjectId(req.params.id) });
        if (!stripePaymentIntent) return next(new ResponseError("Payment intent not found", HTTP_STATUS_CODES.NOT_FOUND));
        if (!req.isAdmin && new Date(stripePaymentIntent.createdDt).getTime() + TEN_MINUTES_IN_MILLISECONDS < new Date().getTime()) return next(new ResponseError("Cannot get the payment intent after payment window of 10 minutes", HTTP_STATUS_CODES.CONFLICT));

        // check the status to determine whether it has been paid
        const stripePaymentIntentInstance = await StripeService.retrievePaymentIntent(stripePaymentIntent.stripePaymentIntentId);

        return res.status(HTTP_STATUS_CODES.OK).send({
            stripePaymentIntent: stripePaymentIntent,
            stripePaymentIntentInstance: stripePaymentIntentInstance
        })
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

router.get('/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
        if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (!req.isAdmin) {
            const lender = await DbService.getOne(COLLECTIONS.LENDERS, { userId: mongoose.Types.ObjectId(req.user._id) });
            if (lender && ride.userId.toString() != req.user._id.toString()) {
                if (vehicle.lenderId.toString() != lender._id.toString()) {
                    return next(new ResponseError("You are not allowed to get this ride", HTTP_STATUS_CODES.FORBIDDEN));
                }
            }
        }

        ride.vehicle = vehicle;
        ride.isLender = !req.isAdmin ? ride.userId.toString() != req.user._id.toString() : false;

        return res.status(HTTP_STATUS_CODES.OK).send({
            ride
        });
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.get('/', authenticate, async (req, res, next) => {
    try {
        let rides = [];
        (!req.isAdmin)
            ? rides = await DbService.getMany(COLLECTIONS.RIDES, { userId: mongoose.Types.ObjectId(req.user._id) })
            : rides = await DbService.getMany(COLLECTIONS.RIDES, {});

        for (let ride of rides) {
            const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
            ride.vehicle = vehicle;
        }

        if (!req.isAdmin) {
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
        }

        return res.status(HTTP_STATUS_CODES.OK).send({
            rides
        });
    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id', authenticate, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    const { error } = rideUpdateValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        if (!req.isAdmin && (Object.keys(req.body).length > 1 || !Object.keys().includes("status")))
            return next(new ResponseError("Only ride status may be changed", HTTP_STATUS_CODES.BAD_REQUEST));

        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        if (!req.admin) {
            if (req.user._id.toString() != ride.userId.toString()) {
                const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, ride.vehicleId);
                if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

                const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
                if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

                if (req.user._id.toString() != lender.userId.toString()) return next(new ResponseError("You do not have permission to change the ride status", HTTP_STATUS_CODES.FORBIDDEN));

                if (!(req.body.status == RIDE_STATUSES.FINISHED && ride.status == RIDE_STATUSES.ONGOING)
                    && !(req.body.status == RIDE_STATUSES.CANCELLED && ride.status == RIDE_STATUSES.PENDING_APPROVAL))
                    return next(new ResponseError("Ride status cannot be changed", HTTP_STATUS_CODES.CONFLICT));

                await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                    status: req.body.status,
                });

                if (req.body.status == RIDE_STATUSES.FINISHED) {
                    await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                        actualReturnDt: new Date().getTime()
                    });
                } else if (req.body.status == RIDE_STATUSES.CANCELLED) {
                    await RideService.refundPayment(ride._id, ride.price.amount, 100);
                }

                return res.sendStatus(HTTP_STATUS_CODES.OK);
            }

            if (!(req.body.status == RIDE_STATUSES.ONGOING && ride.status == RIDE_STATUSES.AWAITING)
                && !(req.body.status == RIDE_STATUSES.CANCELLED && ride.status == RIDE_STATUSES.PENDING_APPROVAL)
                && !(req.body.status == RIDE_STATUSES.CANCELLED && ride.status == RIDE_STATUSES.AWAITING_PAYMENT))
                return next(new ResponseError("Ride status cannot be changed", HTTP_STATUS_CODES.CONFLICT));

            await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                status: req.body.status,
            });

            if (req.body.status == RIDE_STATUSES.ONGOING && ride.status == RIDE_STATUSES.AWAITING) {
                await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) }, {
                    actualPickupDt: new Date().getTime()
                });
            } else if (req.body.status == RIDE_STATUSES.CANCELLED && ride.status == RIDE_STATUSES.PENDING_APPROVAL) {
                await RideService.refundPayment(ride._id, ride.price.amount, 100);
            }

            return res.sendStatus(HTTP_STATUS_CODES.OK);
        }


    } catch (e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    try {
        let event = await StripeService.constructEvent(req.rawBody, signature);

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const stripePaymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { stripePaymentIntentId: paymentIntent.id });
                if (stripePaymentIntent) {
                    const ride = await DbService.getById(COLLECTIONS.RIDES, stripePaymentIntent.rideId)
                    await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(stripePaymentIntent.rideId) }, { status: RIDE_STATUSES.PENDING_APPROVAL });
                    await RideService.addRideToPendingApprovalTimeouts(ride._id, ride.plannedPickupDt, ride.createdDt)
                }
                break;
        }

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

router.post('/:id/stripe/cancel-payment-intent', authenticate, async (req, res, next) => {
    if (!req.isAdmin) return next(new ResponseError("Only admins may file refunds for rides", HTTP_STATUS_CODES.FORBIDDEN));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        const stripePaymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { rideId: mongoose.Types.ObjectId(ride._id) });
        if (!stripePaymentIntent) return next(new ResponseError("Payment intent not found", HTTP_STATUS_CODES.NOT_FOUND));

        await StripeService.cancelPaymentIntent(stripePaymentIntent.stripePaymentIntentId)

        return res.sendStatus(HTTP_STATUS_CODES.OK)
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/:id/stripe/refund', authenticate, async (req, res, next) => {
    if (!req.isAdmin) return next(new ResponseError("Only admins may file refunds for rides", HTTP_STATUS_CODES.FORBIDDEN));

    const { error } = rideRefundPostValidation(req.body);
    if (error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        await RideService.refundPayment(ride._id, ride.price.amount, req.body.percentageOfRefund ? req.body.percentageOfRefund : 100);

        return res.sendStatus(HTTP_STATUS_CODES.OK)
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.delete("/:id", authenticate, async (req, res, next) => {
    if (!req.isAdmin) return next(new ResponseError("Only admins may delete rides", HTTP_STATUS_CODES.FORBIDDEN));

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid ride id", HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const ride = await DbService.getById(COLLECTIONS.RIDES, req.params.id);
        if (!ride) return next(new ResponseError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND));

        await DbService.delete(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(req.params.id) });

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;