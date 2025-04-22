const smartcar = require('smartcar');

const client = new smartcar.AuthClient({
    clientId: process.env.SMARTCAR_ID,
    clientSecret: process.env.SMARTCAR_SECRET,
    redirectUri: `http://localhost:${process.env.PORT}/key/auth-callback`,
    testMode: process.env.NODE_ENVIRONMENT == 'development'
});

const SmartcarService = {
    generateSmartcarConnectAuthRedirect: (keyId) => {
        const scope = ["required:control_security", "required:read_vin"];
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