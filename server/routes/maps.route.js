const express = require('express');
const router = express.Router();
const axios = require('axios');

const ResponseError = require('../errors/responseError');

const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, GOOGLE_API_KEY } = require('../global');

router.get('/places-autocomplete', async (req, res, next) => {
    const { query } = req.query;
    if (!query) return next(new ResponseError("You should provide a query", HTTP_STATUS_CODES.BAD_REQUEST))

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}`);
        return res.status(HTTP_STATUS_CODES.OK).send({
            predictions: response.data.predictions
        });
    } catch (err) {
        return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
    }
});

module.exports = router;
