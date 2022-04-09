const smartcar = require('smartcar');
const { SMARTCAR_ID, SMARTCAR_SECRET, NODE_ENVIRONMENT, NODE_ENVIRONMENTS } = require('../global');

const client = new smartcar.AuthClient({
    clientId: SMARTCAR_ID,
    clientSecret: SMARTCAR_SECRET,
    redirectUri: 'http://localhost:6140/smartcar/auth-callback',
    testMode: NODE_ENVIRONMENT == NODE_ENVIRONMENTS.DEVELOPMENT
});

const SmartcarService = {
    generateSmartcarConnectAuthRedirect: (keyId, vin) => {
        const scope = ["required:control_security"];
        const options = { state: keyId };
        const auth = client.getAuthUrl(scope, options);

        return auth;
    },

    generateAccessTokenByAuthCode: (authCode) => {
        return client.exchangeCode(authCode);
    },

    generateAccessTokenByRefreshToken: (refreshToken) => {
        return client.exchangeRefreshToken(refreshToken);
    },

    getVehicles: (accessToken) => {
        return smartcar.getVehicles(accessToken)
    },

    generateVehicleInstance: (vehicle, accessToken) => {
        return new smartcar.Vehicle(vehicle, accessToken);
    }
}

module.exports = SmartcarService;