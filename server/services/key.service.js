const mongoose = require("mongoose");
const VehicleAction = require("../db/models/vehicleAction.model");
const { KEY_ACTIONS, COLLECTIONS, WEEK_IN_MILLISECONDS } = require("../global");
const DbService = require("./db.service");
const SmartcarService = require("./smartcar.service");
const cron = require('node-cron');

const KeyService = {
    performActionOnVehicle: async (smartcarVehicleId, accessToken, action) => {
        const { vehicles } = await SmartcarService.getVehicles(accessToken);
        for (let currentVehicle of vehicles) {
            const vehicleInstance = SmartcarService.generateVehicleInstance(currentVehicle, accessToken);
            if (vehicleInstance.id.toString() == smartcarVehicleId) {
                switch (action) {
                    case KEY_ACTIONS.UNLOCK:
                        await vehicleInstance.unlock();
                        break;
                    case KEY_ACTIONS.LOCK:
                        await vehicleInstance.lock();
                        break;
                }
            }
        }
        return true;
    },

    saveActionPerformed: async (vehicleId, userId, action) => {
        const vehicleAction = new VehicleAction({
            vehicleId,
            userId,
            action
        });
        await DbService.create(COLLECTIONS.VEHICLE_ACTIONS, vehicleAction);
        return true;
    },

    generateAccess: async (refreshToken, keyId) => {
        const access = await SmartcarService.generateAccessTokenByRefreshToken(refreshToken);
        await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(keyId) }, { smartcarAccessResponse: access });
        return access;
    },

    refreshAllAccess: async () => {
        const keys = await DbService.getMany(COLLECTIONS.KEYS, {});
        for (let key of keys) {
            if (new Date().getTime() + WEEK_IN_MILLISECONDS >= new Date(key.smartcarAccessResponse.refreshExpiration).getTime()) {
                await KeyService.generateAccess(key.smartcarAccessResponse.refreshToken, key._id);
            }
        }
    },

    runCronTaskForRefreshingAccess: async () => {
        cron.schedule('0 0 */7 * *', async function () {
            await this.refreshAllAccess();
        });
    }
}

module.exports = KeyService;