const express = require("express");
const router = express.Router();

const userRoute = require('./user.route');
const lenderRoute = require('./lender.route');
const rideRoute = require('./ride.route');
const vehicleRoute = require('./vehicle.route');
const keyRoute = require('./key.route');
const businessRoute = require('./buisness.route');
const reviewRoute = require('./review.route');

router.use('/user', userRoute);
router.use('/lender', lenderRoute);
router.use('/ride', rideRoute);
router.use('/vehicle', vehicleRoute);
router.use('/key', keyRoute);
router.use('/business', businessRoute);
router.use('/review', reviewRoute);

module.exports = router;