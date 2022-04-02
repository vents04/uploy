// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')('sk_test_z6Wgj3W5n3eYSLEKPRJ4OrE900vpjOnFhP');

const product = await stripe.products.create({name: 'Gold Special'});