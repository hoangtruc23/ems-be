const { logger } = require('../config/loggerConfig')
const PermissionModel = require('../models/permission')

async function PermissionSeeder() {
    await PermissionModel.deleteMany({})
    await PermissionModel.insertMany([
        {
            name: 'Xem người dùng',
            code: 'USER_VIEW',
            parentPermissionId: parent._id,
        },
        {
            name: 'Thêm người dùng',
            code: 'USER_CREATE',
            parentPermissionId: parent._id,
        },
        {
            name: 'Sửa người dùng',
            code: 'USER_EDIT',
            parentPermissionId: parent._id,
        },
        {
            name: 'Xóa người dùng',
            code: 'USER_DELETE',
            parentPermissionId: parent._id,
        },
    ])

    logger.info('PermissionModel Seeded')
}

module.exports = PermissionSeeder
