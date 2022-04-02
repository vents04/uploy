const mongoose = require('mongoose');
const db = mongoose.connection;
const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

const { STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY } = require('../global.js');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const vehicle = await stripe.products.create({name: 'Vehicle'});

const StripeService = {
    getPrice: function (collection, filter) {
        return new Promise(async (resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOne(filter).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    }
}

module.exports = StripeService;

