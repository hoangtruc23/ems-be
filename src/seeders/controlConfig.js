const { logger } = require('../config/loggerConfig')
const ControlConfigModel = require('../models/controlConfig')

async function controlConfigSeeder() {
    await ControlConfigModel.deleteMany({})
    await ControlConfigModel.insertOne({
        controlMode: 'manual',
    })

    logger.info('ControlConfig Seeded')
}

module.exports = controlConfigSeeder
