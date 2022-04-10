const mongoose = require('mongoose');
const DbService = require('./db.service');
const { COLLECTIONS, HTTP_STATUS_CODES, RIDE_STATUSES, STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY, ACCOUNT_LINK_TYPES, NODE_ENVIRONMENTS, NODE_ENVIRONMENT } = require('../global');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const StripeService = {

    createAccount: async (user) => {
        const account = await stripe.accounts.create({
            type: 'express',
            business_type: "individual",
            individual: {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
        return account;
    },

    retrieveAccount: async (accountId) => {
        const account = await stripe.accounts.retrieve(accountId);
        return account;
    },

    createAccountLink: async (stripeAccountId, accountLinkType) => {
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: NODE_ENVIRONMENT == NODE_ENVIRONMENTS.DEVELOPMENT
                ? 'http://localhost:6140/stripe/onboarding/unsuccessful'
                : 'https://api.rentngo.online/stripe/onboarding/unsuccessful',
            return_url: NODE_ENVIRONMENT == NODE_ENVIRONMENTS.DEVELOPMENT
                ? 'http://localhost:6140/stripe/onboarding/successful'
                : 'https://api.rentngo.online/stripe/onboarding/successful',
            type: accountLinkType,
        });
        return accountLink;
    },

    getPrice: (ride) => {
        return new Promise(async (resolve, reject) => {
            if (ride.status != RIDE_STATUSES.ONGOING) {
                try {
                    resolve("Ride has to be started")
                } catch (error) {
                    reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
                }
            } else {
                ride.status == RIDE_STATUSES.FINISHED;
                const vehicle = await DbService.getOne(COLLECTIONS.VEHICLES, { _id: ride.vehicleId });
                const stripeVehicle = await stripe.products.create({
                    metadata: {
                        vehicleId: ride.vehicleId
                    }
                });

                const rideDuration = ride.acReturnDt - ride.acPickupDt;
                const dayInMilliseconds = 1000 * 60 * 60 * 24;
                const dayCounter = Math.ceil(rideDuration / dayInMilliseconds);

                const newPrice = await stripe.prices.create({
                    product: stripeVehicle.id,
                    unit_amount: dayCounter * vehicle.price.amount,
                    currency: vehicle.price.currency
                });
                ride.price.amount = newPrice.unit_amount;
                ride.price.currency = newPrice.currency;
                ride.acReturnDt = Date.now;
                await DbService.update(COLLECTIONS.RIDES, { _id: ride._id }, ride);
                try {
                    resolve(newPrice)
                } catch (error) {
                    reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
                }
            }
        })
    },

    getCustomer: (ride) => {
        return new Promise(async (resolve, reject) => {
            const user = await DbService.getOne(COLLECTIONS.USERS, { _id: ride.userId });

            const customer = await stripe.customers.create({
                email: user.email
            });

            if (!user.customerId) {
                user.customerId = customer.id
                await DbService.update(COLLECTIONS.USERS, { _id: user._id }, user);
            }

            try {
                resolve(customer)
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    createInvoice: (ride) => {
        return new Promise(async (resolve, reject) => {
            const price = this.getPrice(ride);
            const customer = this.getCustomer(ride);
            await stripe.invoiceItems.create({
                customer: customer.id,
                price: price.unit_amount,
            });

            const invoice = await stripe.invoices.create({
                customer: customer.id,
                collection_method: 'send_invoice',
                days_until_due: 14
            });

            const finInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
            try {
                resolve(finInvoice)
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    sendInvoice: (ride) => {
        return new Promise(async (resolve, reject) => {
            const invoice = this.createInvoice(ride);
            await stripe.invoices.sendInvoice(invoice.id);
            try {
                resolve("Invoice sent")
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}

module.exports = StripeService;

