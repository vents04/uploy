const express = require("express");
const router = express.Router();

const Business = require("../db/models/business.model");
const DbService = require("../services/db.service");

const { COLLECTIONS, HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE } = require("../global");
const { authenticate } = require("../middlewares/authenticate");
const { businessPostValidation, businessUpdateValidation } = require("../validation/hapi");

router.post('/', authenticate, async(req, res, next) => {
    const { error } = businessPostValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const existingBusiness = await DbService.getOne(COLLECTIONS.BUSINESSES, { uid: req.body.uid });
        if (existingBusiness) return next(new ResponseError("Business with this unique identifier already exists", HTTP_STATUS_CODES.CONFLICT));
        
        const business = new Business(req.body);
        await DbService.create(COLLECTIONS.BUSINESSES, business);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

router.put('/:id', authenticate, async(req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid business id", HTTP_STATUS_CODES.BAD_REQUEST))

    const { error } = businessUpdateValidation(req.body);
    if(error) return next(new ResponseError(error.details[0].message, HTTP_STATUS_CODES.BAD_REQUEST));

    try {
        const business = await DbService.getById(COLLECTIONS.BUSINESSES, req.params.id);
        if(!business) return next(new ResponseError("Business not found by id", HTTP_STATUS_CODES.NOT_FOUND));

        let isTheUserPartOfTheBusiness = false;
        for(let user of business.users){
            if(user.toString() == req.user._id.toString()){
                isTheUserPartOfTheBusiness = true;
                break;
            }
        }

        if(!isTheUserPartOfTheBusiness) return next(new ResponseError("You do not have permission to update this business", HTTP_STATUS_CODES.FORBIDDEN));

        await DbService.update(COLLECTIONS.BUSINESSES, { _id: mongoose.Types.ObjectId(req.params.id) }, req.body);

        return res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch(e) {
        return next(new ResponseError(e.message || DEFAULT_ERROR_MESSAGE, e.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
});

module.exports = router;