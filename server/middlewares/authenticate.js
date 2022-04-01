const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

const DbService = require('../services/db.service');
const ResponseError = require('../errors/responseError');

const errorHandler = require('../errors/errorHandler');
const AuthenticationService = require('../services/authentication.service');

let authenticate = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        errorHandler(new ResponseError("Token not provided", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
        return;
    }
    try {
        const verified = AuthenticationService.verifyToken(token);
        if (!verified) {
            errorHandler(new ResponseError("Token verification failed", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }

        let user = await DbService.getById(COLLECTIONS.USERS, verified._id);
        if (!user) {
            errorHandler(new ResponseError("User not found", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }
        if (verified.iat <= new Date(user.lastPasswordReset).getTime() / 1000) {
            errorHandler(new ResponseError("Token has expired", HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        errorHandler(new ResponseError(error.message, error.status || HTTP_STATUS_CODES.UNAUTHORIZED), req, res, next);
    }
}

module.exports = {
    authenticate: authenticate
};
