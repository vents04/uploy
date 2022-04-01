const { AUTHENTICATION_TOKEN_KEY } = require('../global');
require("regenerator-runtime"); // causes an error if not required

const Auth = {
    setToken: (token) => {
        localStorage.setItem(AUTHENTICATION_TOKEN_KEY, token);
    },

    getToken: () => {
        return localStorage.getItem(AUTHENTICATION_TOKEN_KEY);
    }
}

module.exports = Auth;