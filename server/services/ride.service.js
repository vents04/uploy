const mongoose = require("mongoose");
const { RIDE_STATUSES, COLLECTIONS, TEN_MINUTES_IN_MILLISECONDS, TWENTY_MINUTES_IN_MILLISECONDS, ONE_DAY_IN_MILLISECONDS } = require("../global");
const DbService = require("./db.service");
const StripeService = require("./stripe.service");

let pendingApprovalRidesTimeouts = [];
let ongoingRidesTimeouts = [];
let awaitingPaymentRidesTimeouts = [];

const RideService = {

    cancelRide: async (rideId) => {
        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(rideId) }, { status: RIDE_STATUSES.CANCELLED_BY_SYSTEM });
        return true;
    },

    finishRide: async (rideId) => {
        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(rideId) }, { status: RIDE_STATUSES.FINISHED, actualReturnDt: new Date().getTime() });
        return true;
    },

    setupCancellationForPendingApprovalRides: async () => {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { status: RIDE_STATUSES.PENDING_APPROVAL });
        for (let ride of rides) {
            if (new Date(ride.plannedPickupDt).getTime() < new Date().getTime()) {
                await RideService.cancelRide(ride._id);
                continue;
            }
            RideService.addRideToPendingApprovalTimeouts(ride._id, ride.plannedPickupDt, ride.createdDt);
        }
        return true;
    },

    addRideToPendingApprovalTimeouts: async (rideId, plannedPickupDt, createdDt) => {
        const rideTimeout = setTimeout(async function () {
            const ride = await DbService.getById(COLLECTIONS.RIDES, rideId);
            if (ride && ride.status == RIDE_STATUSES.PENDING_APPROVAL) {
                await RideService.cancelRide(rideId);
            }
            clearTimeout(pendingApprovalRidesTimeouts[pendingApprovalRidesTimeouts.length - 1])
            pendingApprovalRidesTimeouts.splice(pendingApprovalRidesTimeouts.length - 1, 1);
        }, ((new Date().getTime(createdDt) + (new Date(plannedPickupDt).getTime() - new Date(createdDt).getTime())) - new Date().getTime()) > 6 * ONE_DAY_IN_MILLISECONDS
            ? 3 * ONE_DAY_IN_MILLISECONDS
            : ((new Date().getTime(createdDt) + (new Date(plannedPickupDt).getTime() - new Date(createdDt).getTime()) / 3) - new Date().getTime()));
        pendingApprovalRidesTimeouts.push(rideTimeout);
        return true;
    },

    setupCancellationForOngoingRides: async () => {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { status: RIDE_STATUSES.ONGOING });
        for (let ride of rides) {
            if (new Date(ride.plannedReturnDt).getTime() + TWENTY_MINUTES_IN_MILLISECONDS < new Date().getTime()) {
                await RideService.finishRide(ride._id);
                continue;
            }
            RideService.addRideToOngoingTimeouts(ride._id, ride.plannedReturnDt);
        }
        return true;
    },

    addRideToOngoingTimeouts: async (rideId, plannedReturnDt) => {
        const rideTimeout = setTimeout(async function () {
            const ride = await DbService.getById(COLLECTIONS.RIDES, rideId);
            if (ride && ride.status == RIDE_STATUSES.ONGOING) {
                await RideService.finishRide(rideId);
            }
            clearTimeout(ongoingRidesTimeouts[ongoingRidesTimeouts.length - 1])
            ongoingRidesTimeouts.splice(ongoingRidesTimeouts.length - 1, 1);
        }, ((new Date(plannedReturnDt).getTime() + TWENTY_MINUTES_IN_MILLISECONDS) - new Date().getTime()));
        ongoingRidesTimeouts.push(rideTimeout);
        return true;
    },

    setupCancellationForAwaitingPaymentRides: async () => {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { status: RIDE_STATUSES.AWAITING_PAYMENT });
        for (let ride of rides) {
            if (new Date(ride.createdDt).getTime() + TEN_MINUTES_IN_MILLISECONDS < new Date().getTime()) {
                await RideService.cancelRide(ride._id);
                continue;
            }
            RideService.addRideToAwaitingPaymentTimeouts(ride._id, ride.createdDt);
        }
    },

    addRideToAwaitingPaymentTimeouts: async (rideId, createdDt) => {
        const rideTimeout = setTimeout(async function () {
            const paymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { rideId: mongoose.Types.ObjectId(rideId) });
            if (paymentIntent) {
                const paymentIntentInstance = await StripeService.retrievePaymentIntent(paymentIntent.stripePaymentIntentId);
                if (paymentIntentInstance.status == 'succeeded') {
                    await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(rideId) }, { status: RIDE_STATUSES.PENDING_APPROVAL });
                    return true;
                }
            }
            const ride = await DbService.getById(COLLECTIONS.RIDES, rideId);
            if (ride) {
                if (ride.status != RIDE_STATUSES.CANCELLED
                    && ride.status != RIDE_STATUSES.FINISHED) {
                    await RideService.cancelRide(rideId);
                    await StripeService.cancelPaymentIntent(paymentIntent.stripePaymentIntentId);
                }
            }
            clearTimeout(awaitingPaymentRidesTimeouts[awaitingPaymentRidesTimeouts.length - 1])
            awaitingPaymentRidesTimeouts.splice(awaitingPaymentRidesTimeouts.length - 1, 1);
        }, (new Date(new Date(new Date(createdDt).getTime() + TEN_MINUTES_IN_MILLISECONDS).getTime() - new Date().getTime()).getTime()));
        awaitingPaymentRidesTimeouts.push(rideTimeout);
        return true;
    },

    refundPayment: async (rideId, price, percentageOfRefund) => {
        const ride = await DbService.getById(COLLECTIONS.RIDES, rideId);
        if (ride) {
            const stripePaymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { rideId: mongoose.Types.ObjectId(rideId) });
            if (stripePaymentIntent) {
                await StripeService.refundPaymentIntent(stripePaymentIntent.stripePaymentIntentId, price, percentageOfRefund);
            }
        }
        return true;
    }
}

module.exports = RideService;