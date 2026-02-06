const { logger } = require('../config/loggerConfig')
const ApiModel = require('../models/api')

async function ApiSeeder() {
    await ApiModel.deleteMany({})
    await ApiModel.insertMany([
        { api: '/auth', note: 'Quản lý xác thực người dùng' },
        { api: '/users', note: 'Quản lý người dùng' },
        { api: '/roles', note: 'Quản lý vai trò' },
    ])

    logger.info('Api Seeded')
}

module.exports = ApiSeeder
