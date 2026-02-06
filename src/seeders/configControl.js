const { logger } = require('../config/loggerConfig')
const ConfigControlModel = require('../models/configControl')

async function configControlSeeder() {
    await ConfigControlModel.deleteMany({})
    await ConfigControlModel.insertMany([
        {
            p: 50,
            dentaP: 50,
            dentaT: 5,
            type: 'charge',
            isEnable: true,
        },
        {
            p: 50,
            dentaP: 50,
            dentaT: 5,
            type: 'discharge',
            isEnable: true,
        },
    ])

    logger.info('ConfigControl Seeded')
}

module.exports = configControlSeeder
