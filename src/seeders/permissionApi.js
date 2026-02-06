const { logger } = require('../config/loggerConfig')
const PermissionApiModel = require('../models/permissionApi')

async function PermissionApiSeeder() {
    await PermissionApiModel.deleteMany({})
    await PermissionApiModel.insertMany([
        { permissionId: permissions[0]._id, apiId: apis[0]._id },
        { permissionId: permissions[0]._id, apiId: apis[1]._id },
        { permissionId: permissions[1]._id, apiId: apis[2]._id },
    ])

    logger.info('PermissionApi Seeded')
}

module.exports = PermissionApiSeeder
