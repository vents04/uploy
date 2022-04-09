const mongoose = require("mongoose");
const { RIDE_STATUSES, COLLECTIONS } = require("../global");
const DbService = require("./db.service");

const pendingApprovalRidesTimeouts = [];

const RideService = {
    setupCancellationForPendingApprovalRides: async () => {
        const rides = await DbService.getMany(COLLECTIONS.RIDES, { status: RIDE_STATUSES.PENDING_APPROVAL });
        for (let ride of rides) {
            if (new Date(ride.plannedPickupDt).getTime() < new Date().getTime()) {
                await RideService.cancelRide(ride._id);
                continue;
            }
            RideService.addRideToPendingApprovalTimeouts(ride._id, ride.plannedPickupDt);
        }
    },

    cancelRide: async (rideId) => {
        await DbService.update(COLLECTIONS.RIDES, { _id: mongoose.Types.ObjectId(rideId) }, { status: RIDE_STATUSES.CANCELLED_BY_SYSTEM });
        return true;
    },

    addRideToPendingApprovalTimeouts: async (rideId, plannedPickupDt) => {
        const rideTimeout = setTimeout(function () {
            RideService.cancelRide(rideId);
            clearTimeout(pendingApprovalRidesTimeouts[pendingApprovalRidesTimeouts.length - 1])
            pendingApprovalRidesTimeouts.splice(pendingApprovalRidesTimeouts.length - 1, 1);
        }, (new Date(plannedPickupDt).getTime() - new Date().getTime()) / 2);
        pendingApprovalRidesTimeouts.push(rideTimeout);
        return true;
    }
}

module.exports = RideService;