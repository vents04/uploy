const smartcar = require('smartcar');
const { SMARTCAR_ID, SMARTCAR_SECRET } = require('../global');

const SmartCar = {
    initializeClient: () => {
        const client = new smartcar.AuthClient({
            clientId: SMARTCAR_ID, // fallback to SMARTCAR_CLIENT_ID ENV variable
            clientSecret: SMARTCAR_SECRET, // fallback to SMARTCAR_CLIENT_SECRET ENV variable
            redirectUri: 'http://localhost:6140/smartcar/callback', // fallback to SMARTCAR_REDIRECT_URI ENV variable
            testMode: false, // launch Smartcar Connect in test mode
        });

        console.log(client);
    }
}

module.exports = SmartCar;