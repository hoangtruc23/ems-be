const { logger } = require('../config/loggerConfig')
const SettingModel = require('../models/setting')

async function settingSeeder() {
    await SettingModel.deleteMany({})
    await SettingModel.insertMany([
        {
            nameSoftware: 'Energy Management System',
            note: '',
        },
    ])
    logger.info('Setting Seeded')
}

module.exports = settingSeeder
