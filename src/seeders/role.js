const { logger } = require('../config/loggerConfig')
const RoleModel = require('../models/role')

const ROLE_IDS = {
    root: '68650a52d2be83be41cbd8e1',
    admin: '68650a52d2be83be41cbd8e2',
    operator: '68650a52d2be83be41cbd8e3',
    guest: '68650a52d2be83be41cbd8e4',
}

async function roleSeeder() {
    await RoleModel.deleteMany({})
    await RoleModel.insertMany([
        {
            _id: ROLE_IDS.root,
            name: 'root',
            note: '',
        },
        {
            _id: ROLE_IDS.admin,
            name: 'admin',
            note: '',
        },
        {
            _id: ROLE_IDS.operator,
            name: 'operator',
            note: '',
        },
        {
            _id: ROLE_IDS.guest,
            name: 'guest',
            note: '',
        },
    ])
    logger.info('Role Seeded')
}

module.exports = roleSeeder
module.exports.ROLE_IDS = ROLE_IDS
