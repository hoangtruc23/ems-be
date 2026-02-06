const { logger } = require('../config/loggerConfig')
const RolePermissionModel = require('./rolePermission')
async function RolePermissionSeeder() {
    await RolePermissionModel.deleteMany({})
    await RolePermissionModel.insertMany([
        { roleId: roles[0]._id, permissionId: permissions[0]._id },
        { roleId: roles[0]._id, permissionId: permissions[1]._id },
        { roleId: roles[1]._id, permissionId: permissions[2]._id },
        { roleId: roles[1]._id, permissionId: permissions[3]._id },
    ])

    logger.info('Role Permission Seeded')
}

module.exports = RolePermissionSeeder
