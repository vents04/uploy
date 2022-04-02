const axios = require('axios');
const Auth = require('./Auth');

const { ROOT_URLS, AUTHENTICATION_TOKEN_KEY } = require('../global');

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
            `${ROOT_URLS.API}/${path}`,
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
            `${ROOT_URLS.API}/${path}`,
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
            `${ROOT_URLS.API}/${path}`,
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
            `${ROOT_URLS.API}/${path}`,
            {
                headers: finalHeaders
            }
        )
    },

    getPlace: async (id) => {
        return axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?place_id=${id}&key=AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4`
        )
    }
}

module.exports = ApiRequests;