const { COLLECTIONS, ADMIN_STATUSES } = require('../global');
const DbService = require('../services/db.service');
const mongoose = require('mongoose');

const AdminService = {
    isAdminAuthenticated: async (userId, secret) => {
        const admin = await DbService.getOne(COLLECTIONS.ADMINS, { userId: mongoose.Types.ObjectId(userId) });
        if (!admin || admin.status != ADMIN_STATUSES.ACTIVE) return false;
        if (secret != process.env.ADMIN_SECRET) return false;
        return true;
    },
}

module.exports = AdminService;