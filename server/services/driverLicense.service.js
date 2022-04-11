const { default: mongoose } = require("mongoose");
const { COLLECTIONS, DRIVER_LICENSE_STATUSES } = require("../global");
const DbService = require("./db.service");

let driverLicensesExpirationTimeouts = []

const DriverLicenseService = {
    setupDriverLicensesExpirationTimeouts: async () => {
        const driverLicenses = await DbService.getMany(COLLECTIONS.DRIVER_LICENSES, { status: DRIVER_LICENSE_STATUSES.APPROVED });
        for (let driverLicense of driverLicenses) {
            if (new Date(driverLicense.expiryDt).getTime() < new Date().getTime()) {
                await DriverLicenseService.changeDriverLicenseStatusToExpired(driverLicense._id);
                continue;
            }
            DriverLicenseService.addToDriverLicensesExpirationTimeouts(driverLicense._id, driverLicense.expiryDt);
        }
        return true;
    },

    addToDriverLicensesExpirationTimeouts: async (driverLicenseId, expiryDt) => {
        const driverLicenseTimeout = setTimeout(function () {
            DriverLicenseService.changeDriverLicenseStatusToExpired(driverLicenseId);
            clearTimeout(driverLicensesExpirationTimeouts[driverLicensesExpirationTimeouts.length - 1])
            driverLicensesExpirationTimeouts.splice(driverLicensesExpirationTimeouts.length - 1, 1);
        }, (new Date(expiryDt).getTime() - new Date().getTime()));
        driverLicensesExpirationTimeouts.push(driverLicenseTimeout);
        return true;
    },

    changeDriverLicenseStatusToExpired: async (driverLicenseId) => {
        await DbService.update(COLLECTIONS.DRIVER_LICENSES, { _id: mongoose.Types.ObjectId(driverLicenseId) }, { status: DRIVER_LICENSE_STATUSES.EXPIRED });
        return true;
    },
}

module.exports = DriverLicenseService;