const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DbService = require('../services/db.service');
const SmartcarService = require('../services/smartcar.service');
const { authenticate } = require('../middlewares/authenticate');

const { HTTP_STATUS_CODES, DEFAULT_ERROR_MESSAGE, COLLECTIONS, KEY_STATUSES, RIDE_STATUSES, KEY_ACTIONS, UNLOCK_TYPES } = require('../global');
const ResponseError = require('../errors/responseError');
const KeyService = require('../services/key.service');

router.get('/:id/auth-redirect', authenticate, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));

  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.id);
    if (!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));
    if (key.status != KEY_STATUSES.PENDING_AUTH_FLOW) return next(new ResponseError("Cannot generate auth redirect for keys that are not in pending auth flow", HTTP_STATUS_CODES.CONFLICT));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if (lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot add key for this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    const authRedirectUrl = SmartcarService.generateSmartcarConnectAuthRedirect(req.params.id);
    return res.status(HTTP_STATUS_CODES.OK).send({
      authRedirectUrl
    });
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

router.get('/auth-callback', async (req, res, next) => {
  if (req.query.error) {
    return next(new ResponseError("Error in auth flow", HTTP_STATUS_CODES.BAD_REQUEST));
  }

  let finalVehicle = null;
  const code = req.query.code;
  const keyId = req.query.state;

  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, keyId);
    if (!key) throw new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND);
    if (key.status != KEY_STATUSES.PENDING_AUTH_FLOW) throw new ResponseError("Cannot add a digital key if key status is not pending auth flow", HTTP_STATUS_CODES.CONFLICT);

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if (!vehicle) throw new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND)

    const authResponse = await SmartcarService.generateAccessTokenByAuthCode(code);
    const { vehicles } = await SmartcarService.getVehicles(authResponse.accessToken);
    for (let smartcarVehicle of vehicles) {
      const smartcarVehicleInstance = await SmartcarService.generateVehicleInstance(smartcarVehicle, authResponse.accessToken);
      if ((await smartcarVehicleInstance.vin()).vin == vehicle.vin) {
        finalVehicle = smartcarVehicleInstance;
        break;
      }
    }

    if (!finalVehicle) throw new ResponseError("We could not get access to your vehicle", HTTP_STATUS_CODES.BAD_REQUEST);

    await finalVehicle.unlock();
    await finalVehicle.lock();

    await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(keyId) }, { smartcarAccessResponse: authResponse, status: KEY_STATUSES.ACTIVE, smartcarVehicleId: finalVehicle.id });

    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    if (finalVehicle) {
      await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(keyId) }, { smartcarAccessResponse: {}, status: KEY_STATUSES.PENDING_AUTH_FLOW, smartcarVehicleId: null });
    }
    return res.status(HTTP_STATUS_CODES.OK).send({
      error: err.message || DEFAULT_ERROR_MESSAGE,
      status: err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      dt: new Date().getTime()
    })
  }
});

router.get('/:id/access', authenticate, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));

  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.id);
    if (!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if (lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot add key for this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    const access = await SmartcarService.generateAccessTokenByRefreshToken(key.smartcarAccessResponse.refreshToken);
    await DbService.update(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(req.params.id) }, { smartcarAccessResponse: access });
    return res.status(HTTP_STATUS_CODES.OK).send({
      access
    });
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

router.post('/:id/:action', authenticate, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));
  if (!Object.values(KEY_ACTIONS).includes(req.params.action)) return next(new ResponseError("Invalid action", HTTP_STATUS_CODES.BAD_REQUEST));

  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.id);
    if (!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));
    if (key.status != KEY_STATUSES.ACTIVE) return next(new ResponseError("Digital vehicle key is not active", HTTP_STATUS_CODES.CONFLICT));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if (lender.userId.toString() == req.user._id.toString()) {
      const ride = await DbService.getOne(COLLECTIONS.RIDES, { vehicleId: mongoose.Types.ObjectId(vehicle._id), status: RIDE_STATUSES.ONGOING });
      if (ride.unlockType == UNLOCK_TYPES.AUTOMATIC) return next(new ResponseError("Performing actions on vehicle is prohibited during ongoing rides", HTTP_STATUS_CODES.CONFLICT));

      const access = await KeyService.generateAccess(key.smartcarAccessResponse.refreshToken, req.params.id);
      await KeyService.performActionOnVehicle(key.smartcarVehicleId.toString(), access.accessToken, req.params.action);
      await KeyService.saveActionPerformed(vehicle._id, req.user._id, req.params.action);
      return res.sendStatus(HTTP_STATUS_CODES.OK);
    }

    let canUnlock = false;
    const ride = await DbService.getOne(COLLECTIONS.RIDES, { vehicleId: mongoose.Types.ObjectId(vehicle._id), status: RIDE_STATUSES.ONGOING });
    if (ride.userId.toString() == req.user._id.toString()) {
      if (ride.unlockType != UNLOCK_TYPES.AUTOMATIC) return next(new ResponseError("Unlocking vehicle with digital key for this ride is not allowed", HTTP_STATUS_CODES.CONFLICT));
      canUnlock = true;
    }

    if (!canUnlock) return next(new ResponseError("Cannot unlock this vehicle", HTTP_STATUS_CODES.FORBIDDEN));

    const access = await KeyService.generateAccess(key.smartcarAccessResponse.refreshToken, req.params.id);
    await KeyService.performActionOnVehicle(key.smartcarVehicleId.toString(), access.accessToken, req.params.action);
    await KeyService.saveActionPerformed(vehicle._id, req.user._id, req.params.action);
    return res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR))
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return next(new ResponseError("Invalid key id", HTTP_STATUS_CODES.BAD_REQUEST));

  try {
    const key = await DbService.getById(COLLECTIONS.KEYS, req.params.id);
    if (!key) return next(new ResponseError("Key not found", HTTP_STATUS_CODES.NOT_FOUND));

    const vehicle = await DbService.getById(COLLECTIONS.VEHICLES, key.vehicleId);
    if (!vehicle) return next(new ResponseError("Vehicle not found", HTTP_STATUS_CODES.NOT_FOUND));

    const lender = await DbService.getById(COLLECTIONS.LENDERS, vehicle.lenderId);
    if (!lender) return next(new ResponseError("Lender not found", HTTP_STATUS_CODES.NOT_FOUND));

    if (lender.userId.toString() != req.user._id.toString()) return next(new ResponseError("Cannot delete key for this vehicle", HTTP_STATUS_CODES.FORBIDDEN))

    const rides = await DbService.getMany(COLLECTIONS.RIDES, {
      vehicleId: mongoose.Types.ObjectId(vehicle._id),
      "$or": [
        { status: RIDE_STATUSES.AWAITING },
        { status: RIDE_STATUSES.AWAITING_PAYMENT },
        { status: RIDE_STATUSES.ONGOING },
        { status: RIDE_STATUSES.PENDING_APPROVAL }
      ],
      unlockType: UNLOCK_TYPES.AUTOMATIC
    });
    if (rides.length > 0) return next(new ResponseError("Cannot remove digital key because there are current and/or future rides which are not cancelled, finished or cancelled by the system that rely on the digital key", HTTP_STATUS_CODES.CONFLICT))

    let updatedVehicleUnlockType = false;
    await DbService.delete(COLLECTIONS.KEYS, { _id: mongoose.Types.ObjectId(req.params.id) });
    if (Object.values(vehicle.unlockTypes).includes(UNLOCK_TYPES.AUTOMATIC)) {
      await DbService.update(COLLECTIONS.VEHICLES, { _id: mongoose.Types.ObjectId(vehicle._id) }, { unlockTypes: [UNLOCK_TYPES.MANUAL] });
      updatedVehicleUnlockType = true;
    }

    return res.status(HTTP_STATUS_CODES.OK).send({
      updatedVehicleUnlockType
    })
  } catch (err) {
    return next(new ResponseError(err.message || DEFAULT_ERROR_MESSAGE, err.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
  }
});

module.exports = router;