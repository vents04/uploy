const express = require("express");
const router = express.Router();

const userRoute = require('./user.route');
const lenderRoute = require('./lender.route');

router.use('/user', userRoute);
router.use('/lender', lenderRoute);

module.exports = router;