const axios = require('axios');
const Auth = require('./Auth');

const { ROOT_URL_API, AUTHENTICATION_TOKEN_KEY } = require('../global');

const ApiRequests = {
    get: async (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.get(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders,
            }
        )
    },

    post: async (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.post(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders,
            }
        )
    },

    put: async (path, headers, payload, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.put(
            `${ROOT_URL_API}/${path}`,
            payload,
            {
                headers: finalHeaders
            }
        )
    },

    delete: async (path, headers, applyAuthToken) => {
        const finalHeaders = {
            ...headers
        };
        if (applyAuthToken) {
            const token = await Auth.getToken();
            finalHeaders[`${AUTHENTICATION_TOKEN_KEY}`] = token;
        }
        return axios.delete(
            `${ROOT_URL_API}/${path}`,
            {
                headers: finalHeaders
            }
        )
    }
}

module.exports = ApiRequests;