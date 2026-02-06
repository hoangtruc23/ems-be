const { logger } = require('../config/loggerConfig')
const ConfigFtpModel = require('../models/configFtp')

async function configFtpSeeder() {
    await ConfigFtpModel.deleteMany({})
    await ConfigFtpModel.insertOne({
        host: '45.77.242.220',
        port: 22,
        username: 'siginx',
        password: 'ah5P7v,D^HwVCWv2',
        fileType: 'CSV',
        folderName: 'uploads',
    })

    logger.info('configFtp Seeded')
}

module.exports = configFtpSeeder
