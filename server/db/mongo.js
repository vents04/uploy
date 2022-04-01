const mongoose = require("mongoose");
const { DB_URI, HTTP_STATUS_CODES } = require("../global");
const ResponseError = require('../errors/responseError');

const connect = (dbUri = DB_URI) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        mongoose.connection.on('error', () => {
            reject(new ResponseError("Error while connecting to Mongo"), HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        });
        resolve();
    });
};

const disconnect = async () => {
    await mongoose.connection.disconnect();
};

module.exports = { connect, disconnect };
