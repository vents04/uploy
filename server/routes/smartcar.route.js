const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const SmartcarService = require('../services/smartcar.service');
const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, KEY_STATUSES, RIDE_STATUSES, KEY_ACTIONS, UNLOCK_TYPES } = require('../global');
const ResponseError = require('../errors/responseError');
const VehicleAction = require('../db/models/vehicleAction.model');

async function performActionOnVehicle(smartcarVehicleId, accessToken, action) {
  const { vehicles } = await SmartcarService.getVehicles(accessToken);
  for(let currentVehicle of vehicles) {
    const vehicleInstance = SmartcarService.generateVehicleInstance(currentVehicle, accessToken);
    if(vehicleInstance.id.toString() == smartcarVehicleId) {
      switch(action) {
        case KEY_ACTIONS.UNLOCK:
          await vehicleInstance.unlock();
          break;
        case KEY_ACTIONS.LOCK: 
          await vehicleInstance.lock();
          break;
      }
    }
  }
}

async function saveActionPerformed(vehicleId, userId, action) {
  const vehicleAction = new VehicleAction({
    vehicleId,
    userId,
    action
  });
  await DbService.create(COLLECTIONS.VEHICLE_ACTIONS, vehicleAction);
}

async function generateAccess(refreshToken, keyId) {
  const access = await SmartcarService.generateAccessTokenByRefreshToken(refreshToken);
  await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(keyId) }, { smartcarAccessResponse: access });
  return access;
}

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

router.get('/auth-callback', async (req, res, next) => {
  if(req.query.error) {
    return next(new ResponseError("Error in auth flow", HTTP_STATUS_CODES.BAD_REQUEST));
  }

  try {
    const code = req.query.code;
    const keyId = req.query.state;
    
    const key = await DbService.getById(COLLECTIONS.KEYS, keyId);
    if(!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));
    if(key.status != KEY_STATUSES.PENDING_AUTH_FLOW) return next(new ResponseError("Cannot add a digital key if key status is not pending auth flow", HTTP_STATUS_CODES.CONFLICT));

    const authResponse = await SmartcarService.generateAccessTokenByAuthCode(code);
    const { vehicles } = await SmartcarService.getVehicles(authResponse.accessToken);
    const vehicle = await SmartcarService.generateVehicleInstance(vehicles[0], authResponse.accessToken);

    await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(keyId) }, { smartcarAccessResponse: authResponse, status: KEY_STATUSES.ACTIVE, smartcarVehicleId: vehicle.id });

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

router.get('/:keyId/access', authenticate, async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.keyId)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));
  
  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.keyId);
    if(!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if(!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if(!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if(lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot add key for this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    const access = await SmartcarService.generateAccessTokenByRefreshToken(key.smartcarAccessResponse.refreshToken);
    await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(req.params.keyId) }, { smartcarAccessResponse: access });
    return res.status(HTTP_STATUS_CODES.OK).send({
      access
    });
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

router.post('/:keyId/:action', authenticate, async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.keyId)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));
  if(!Object.values(KEY_ACTIONS).includes(req.params.action)) return next(new ResponseError("Invalid action", HTTP_STATUS_CODES.BAD_REQUEST));
 
  try {
    console.log("1")
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.keyId);
    if(!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));
    if(key.status != KEY_STATUSES.ACTIVE) return next(new ResponseError("Digital vehicle key is not active", HTTP_STATUS_CODES.CONFLICT));
    console.log("2")
    
    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if(!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));
    console.log("3")

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if(!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));
    console.log("4")

    if(lender.userId.toString() == req.user._id.toString()) {
      console.log("5")
      const access = await generateAccess(key.smartcarAccessResponse.refreshToken, req.params.keyId);
      await performActionOnVehicle(key.smartcarVehicleId.toString(), access.accessToken, req.params.action);
      console.log("6")

      await saveActionPerformed(vehicle._id, req.user._id, req.params.action);
    console.log("7")
    
      return res.sendStatus(HTTP_STATUS_CODES.OK);
    }

    let canUnlock = false;
    const rides = await DbService.getMany(COLLECTIONS.RIDES, { vehicleId: mongoose.Types.ObjectId(vehicle._id), status: RIDE_STATUSES.ONGOING });
    console.log("8")
    for(let ride of rides) {
      if(ride.userId.toString() == req.user._id.toString()) {
    console.log("9")
        if(ride.unlockType != UNLOCK_TYPES.AUTOMATIC)  return next(new ResponseError("Unlocking vehicle with digital key for this ride is not allowed", HTTP_STATUS_CODES.CONFLICT));
        canUnlock = true;
        break;
      }
    }

    if(!canUnlock) return next(new ResponseError("Cannot unlock this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    console.log("10")
    
    const access = await generateAccess(key.smartcarAccessResponse.refreshToken, req.params.keyId);
    await performActionOnVehicle(key.smartcarVehicleId.toString(), access.accessToken, req.params.action);
    console.log("11")
    await saveActionPerformed(vehicle._id, req.user._id, req.params.action);
    console.log("12")
    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

module.exports = router;