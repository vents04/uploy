const { COLLECTIONS, ADMIN_STATUSES, ADMIN_SECRET } = require('../global');
const DbService = require('../services/db.service');
const mongoose = require('mongoose');

const AdminService = {
    isAdminAuthenticated: async (userId, secret) => {
        const admin = await DbService.getOne(COLLECTIONS.ADMINS, { userId: mongoose.Types.ObjectId(userId) });
        console.log(userId)
        if (!admin || admin.status != ADMIN_STATUSES.ACTIVE) return false;
        if (secret != ADMIN_SECRET) return false;
        return true;
    },
}

module.exports = AdminService;