const mongoose = require('mongoose');
const db = mongoose.connection;
const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

const { STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY } = require('../global.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const StripeService = {
    getPrice: function (vehicle, price) {
        return new Promise(async (resolve, reject) => {
            validateCollection(collection, reject);
            const newVehicle = await stripe.products.create({name: vehicle.title});
            const newPrice = await stripe.prices.create({
                product: newVehicle.id,
                unit_amount: price.amount,
                currency: price.currency
            });
            try {
                resolve(newPrice)
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    }
}

module.exports = StripeService;

