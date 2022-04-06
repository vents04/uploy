const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const SmartcarService = require('../services/smartcar.service');
const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, KEY_STATUSES } = require('../global');
const ResponseError = require('../errors/responseError');

router.get('/auth-redirect/:keyId', authenticate, async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.keyId)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));
  
  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.keyId);
    if(!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));
    if(key.status != KEY_STATUSES.PENDING_AUTH_FLOW) return next(new ResponseError("Cannot generate auth redirect for keys that are not in pending auth flow", HTTP_STATUS_CODES.CONFLICT));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if(!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if(!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if(lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot add key for this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    const authRedirectUrl = SmartcarService.generateSmartcarConnectAuthRedirect(req.params.keyId);
    return res.status(HTTP_STATUS_CODES.OK).send({
      authRedirectUrl
    });
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

module.exports = router;