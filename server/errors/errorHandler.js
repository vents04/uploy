const { HTTP_STATUS_CODES } = require('../global');

const Logger = require('./logger');
const logger = new Logger();

const errorHandler = (error, req, res, next) => {
    logger.error(error.message, {
        clientIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        dt: new Date().getTime()
    });
    return res.status(error.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send({
        status: error.status,
        error: error.message,
        dt: new Date().getTime()
    });
}

module.exports = errorHandler;