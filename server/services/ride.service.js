const mongoose = require("mongoose");
const { RIDE_STATUSES, COLLECTIONS, TEN_MINUTES_IN_MILLISECONDS } = require("../global");
const DbService = require("./db.service");
const StripeService = require("./stripe.service");

const pendingApprovalRidesTimeouts = [];
const awaitingPaymentRidesTimeouts = [];

const RideService = {
    setupCancellationForPendingApprovalRides: async () => {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { status: RIDE_STATUSES.PENDING_APPROVAL });
        for (let ride of rides) {
            if (new Date(ride.plannedPickupDt).getTime() < new Date().getTime()) {
                await RideService.cancelRide(ride._id);
                continue;
            }
            RideService.addRideToPendingApprovalTimeouts(ride._id, ride.plannedPickupDt, ride.createdDt);
        }
    },

    cancelRide: async (rideId) => {
        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(rideId) }, { status: RIDE_STATUSES.CANCELLED_BY_SYSTEM });
        return true;
    },

    addRideToPendingApprovalTimeouts: async (rideId, plannedPickupDt, createdDt) => {
        const rideTimeout = setTimeout(function () {
            RideService.cancelRide(rideId);
            clearTimeout(pendingApprovalRidesTimeouts[pendingApprovalRidesTimeouts.length - 1])
            pendingApprovalRidesTimeouts.splice(pendingApprovalRidesTimeouts.length - 1, 1);
        }, ((new Date().getTime(createdDt) + (new Date(plannedPickupDt).getTime() - new Date(createdDt).getTime()) / 2) - new Date().getTime()));
        pendingApprovalRidesTimeouts.push(rideTimeout);
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
            RideService.cancelRide(rideId);
            await StripeService.cancelPaymentIntent(paymentIntent.stripePaymentIntentId);
            clearTimeout(awaitingPaymentRidesTimeouts[awaitingPaymentRidesTimeouts.length - 1])
            awaitingPaymentRidesTimeouts.splice(awaitingPaymentRidesTimeouts.length - 1, 1);
        }, (new Date(new Date(new Date(createdDt).getTime() + TEN_MINUTES_IN_MILLISECONDS).getTime() - new Date().getTime()).getTime()));
        awaitingPaymentRidesTimeouts.push(rideTimeout);
        return true;
    },

    refundPayment: async (rideId) => {
        const ride = await DbService.getById(COLLECTIONS.RIDES, rideId);
        if (ride) {
            const stripePaymentIntent = await DbService.getOne(COLLECTIONS.STRIPE_PAYMENT_INTENTS, { rideId: mongoose.Types.ObjectId(rideId) });
            if (stripePaymentIntent) {
                await StripeService.refundPaymentIntent(stripePaymentIntent.stripePaymentIntentId);
            }
        }
        return true;
    }
}

module.exports = RideService;