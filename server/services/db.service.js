const mongoose = require('mongoose');
const db = mongoose.connection;
const { COLLECTIONS, HTTP_STATUS_CODES } = require('../global');

const ResponseError = require('../errors/responseError');

const validateCollection = (collection, reject) => {
    if (!Object.keys(COLLECTIONS).some(function (property) { return COLLECTIONS[property] === collection })) {
        reject(new ResponseError(`Invalid collection`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
    }
}

const DbService = {
    getOne: function (collection, filter) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOne(filter).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    getMany: function (collection, filter) {
        return new Promise(async (resolve, reject) => {
            validateCollection(collection, reject);
            let results = [];
            try {
                db.collection(collection).find(filter, async function (err, cursor) {
                    if (err) return reject(new ResponseError(err.message || HTTP_STATUS_CODES.INTERNAL_SERVER));
                    await cursor.forEach(result => {
                        results.push(result);
                    })
                    resolve(results);
                });
            } catch (error) {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            }
        })
    },

    getById: function (collection, id) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOne({ _id: mongoose.Types.ObjectId(id) }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    create: function (collection, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).insertOne(data).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    update: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$set": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    pushUpdate: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$push": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    pullUpdate: function (collection, filter, data) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndUpdate(filter, { "$pull": data }).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    },

    delete: function (collection, filter) {
        return new Promise((resolve, reject) => {
            validateCollection(collection, reject);
            db.collection(collection).findOneAndDelete(filter).then(resolve).catch((error) => {
                reject(new ResponseError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR));
            });
        })
    }
}

module.exports = DbService;

