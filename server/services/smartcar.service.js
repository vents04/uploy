const smartcar = require('smartcar');
const { SMARTCAR_ID, SMARTCAR_SECRET } = require('../global');

const SmartcarService = {
    generateSmartcarConnectAuthRedirect: (keyId) => {
        const client = new smartcar.AuthClient({
            clientId: SMARTCAR_ID, 
            clientSecret: SMARTCAR_SECRET, 
            redirectUri: 'http://localhost:6140/smartcar/auth-callback', 
        });

        const scope = ["required:control_security"];
        const options = { state: keyId, single_select: true };
        const auth = client.getAuthUrl(scope, options);

       return auth;
    }
}

module.exports = SmartcarService;