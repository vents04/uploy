const express = require('express');
const smartcar = require('smartcar');
const { SMARTCAR_ID, SMARTCAR_SECRET, HTTP_STATUS_CODES } = require('../global');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

const client = new smartcar.AuthClient({
    clientId: SMARTCAR_ID, // fallback to SMARTCAR_CLIENT_ID ENV variable
    clientSecret: SMARTCAR_SECRET, // fallback to SMARTCAR_CLIENT_SECRET ENV variable
    redirectUri: 'http://localhost:6140/smartcar/callback', // fallback to SMARTCAR_REDIRECT_URI ENV variable
    testMode: false, // launch Smartcar Connect in test mode
});

router.get('/login', function(req, res) {
    const link = client.getAuthUrl(['read_vehicle_info', 'control_security']);
  
    // redirect to the link
    res.redirect(link);
  });
  
  // Handle Smartcar callback with auth code
  router.get('/callback', async function(req, res, next) {
    let access;
  
    if (req.query.error) {
      // the user denied your requested permissions
      return next(new Error(req.query.error));
    }
  
    // exchange auth code for access token
    const tokens = await client.exchangeCode(req.query.code)
    // get the user's vehicles
    console.log(tokens);
    const vehicles = await smartcar.getVehicles(tokens.accessToken);
    // instantiate first vehicle in vehicle list
    const vehicle = new smartcar.Vehicle(vehicles.vehicles[0], tokens.accessToken);
    console.log("vehicle", vehicle);
    // get identifying information about a vehicle
    const attributes = await vehicle.attributes();
    console.log(attributes);

   
    // {
    //   "id": "36ab27d0-fd9d-4455-823a-ce30af709ffc",
    //   "make": "TESLA",
    //   "model": "Model S",
    //   "year": 2014
    //   "meta": {
    //     "requestId": "ada7207c-3c0a-4027-a47f-6215ce6f7b93"
    //   }
    // }
  });

router.post('/unlock/:key', async (req, res, next) => {
  //const vehicle = new smartcar.Vehicle("6da478ec-226e-4919-8ed0-199edb308ae2", 'd5754335-c47d-4e68-b630-eb808100a97b');
    //await vehicle.unlock();

    res.sendStatus(HTTP_STATUS_CODES.OK)
})

module.exports = router;