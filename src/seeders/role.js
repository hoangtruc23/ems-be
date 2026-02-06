const { logger } = require('../config/loggerConfig')
const RoleModel = require('../models/role')

async function roleSeeder() {
    await RoleModel.deleteMany({})
    await RoleModel.insertMany([
        {
            name: 'root',
            note: '',
        },
        {
            name: 'admin',
            note: '',
        },
        {
            name: 'operator',
            note: '',
        },
        {
            name: 'guest',
            note: '',
        },
    ])
    logger.info('Role Seeded')
}

module.exports = roleSeeder
