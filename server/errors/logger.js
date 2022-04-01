const winston = require('winston');

const { NODE_ENVIRONMENT, NODE_ENVIRONMENTS } = require('../global');

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: 'white',
        debug: 'green',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'red',
    },
};

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    }),
);

class Logger {
    constructor() {
        const fileTransport = new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        });
        const consoleTransport = new winston.transports.Console({
            format: formatter,
        });
        this.logger = winston.createLogger({
            level: NODE_ENVIRONMENT == NODE_ENVIRONMENTS.DEVELOPMENT ? 'trace' : 'error',
            levels: customLevels.levels,
            transports: NODE_ENVIRONMENT == NODE_ENVIRONMENTS.DEVELOPMENT ? [consoleTransport] : [fileTransport],
        });
        winston.addColors(customLevels.colors);
    }

    trace(msg, meta) {
        this.logger.log('trace', msg, meta);
    }

    debug(msg, meta) {
        this.logger.debug(msg, meta);
    }

    info(msg, meta) {
        this.logger.info(msg, meta);
    }

    warn(msg, meta) {
        this.logger.warn(msg, meta);
    }

    error(msg, meta) {
        this.logger.error(msg, meta);
    }

    fatal(msg, meta) {
        this.logger.log('fatal', msg, meta);
    }
}

module.exports = Logger;