const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { JWT_SECRET } = require('../global');

const AuthenticationService = {
    generateToken: (meta) => {
        const token = jwt.sign(meta, JWT_SECRET);
        return token;
    },

    verifyToken: (token) => {
        const verified = jwt.verify(token, JWT_SECRET);
        return verified;
    },

    hashPassword: (password) => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    },

    verifyPassword: (password, hash) => {
        return bcrypt.compareSync(password, hash);
    }
}

module.exports = AuthenticationService;