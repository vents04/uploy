const mongoose = require('mongoose');
const db = mongoose.connection;
const { COLLECTIONS, HTTP_STATUS_CODES, RIDE_STATUSES } = require('../global');
const DbService = require('./db.service');

const { STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY } = require('../global.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const StripeService = {
    getPrice: function (ride) {
        return new Promise(async (resolve, reject) => {
            if(ride.status != RIDE_STATUSES.ONGOING){
                try {
                    resolve("Ride has to have been started")
                } catch (error) {
                    reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
                }
            }else {
                ride.status == RIDE_STATUSES.FINISHED;
                const vehicle = await DbService.getOne(COLLECTIONS.VEHICLES, {_id: ride.vehicleId});
                const stripeVehicle = await stripe.products.create({
                    metadata: {
                        vehicleId: ride.vehicleId
                    }
                });

                const rideDuration = ride.acReturnDt - ride.acPickupDt;
                const dayInMiliseconds = 1000*60*60*24;
                const dayCounter = Math.ceil(rideDuration/dayInMiliseconds);
                
                const newPrice = await stripe.prices.create({
                    product: stripeVehicle.id,
                    unit_amount: dayCounter * vehicle.price.amount,
                    currency: vehicle.price.currency
                });
                ride.price.amount = newPrice.unit_amount;
                ride.price.currency = newPrice.currency;
                ride.acReturnDt = Date.now;
                await DbService.update(COLLECTIONS.RIDES, {_id: ride._id}, ride);
                try {
                    resolve(newPrice)
                } catch (error) {
                    reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
                }
            }
        })
    },
    getCustomer: function(ride) {
        return new Promise(async (resolve, reject) => {
            const user = await DbService.getOne(COLLECTIONS.USERS, {_id: ride.userId});

            const customer = await stripe.customers.create({
                email: user.email
            });

            user.customerId = customer.id
            await DbService.update(COLLECTIONS.USERS, {_id: user._id}, user);

            try {
                resolve(customer)
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },
    createInvoice: function(ride) {
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
    sendInvoice: function(ride) {
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

