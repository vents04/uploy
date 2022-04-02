const express = require("express");
const Business = require("../db/models/buisness.model");
const { COLLECTIONS, HTTP_STATUS_CODES } = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const DbService = require("../services/db.service");
const { postRideValidation } = require("../validation/hapi");
const router = express.Router();

router.post('/', authenticate, async(req, res, next) => {
    const { error } = postRideValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingBusiness = await DbService.getOne(COLLECTIONS.BUSINESSES, {uid: req.body.uid});
        if(existingBusiness) return next(new ResponseError("A business with this id already exists", HTTP_STATUS_CODES.CONFLICT));
        
        const business = new Business(req.body);
        await DbService.create(COLLECTIONS.BUSINESSES, business);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.post('/update', authenticate, async(req, res, next) => {
    const { error } = postRideValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const business = await DbService.getOne(COLLECTIONS.BUSINESSES, {uid: req.body.uid});
        if(!business) return next(new ResponseError("The business that you are trying to update does not exist", HTTP_STATUS_CODES.NOT_FOUND));

        let isTheUserPartOfTheBusiness = false;
        for(let i in business.users){
            if(business.users[i]._id == req.user._id){
                isTheUserPartOfTheBusiness = true;
                break;
            }
        }

        if(!isTheUserPartOfTheBusiness) return next(new ResponseError("You do not have permission to update this business", HTTP_STATUS_CODES.UNAUTHORIZED));

        await DbService.update(COLLECTIONS.BUSINESSES, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;