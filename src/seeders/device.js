const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')

async function deviceSeeder() {
    await DeviceModel.deleteMany({})
    await DeviceModel.insertMany([
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0a'),
            deviceName: 'BESS',
            location: 'HCM',
            host: '192.168.1.96',
            port: '502',
            slaveId: 1,
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0b'),
            deviceName: 'Gateway',
            location: 'HCM',
            host: '192.168.1.96',
            port: '502',
            slaveId: 1,
            isEnable: false,
        },
    ])
    logger.info('DeviceSeeder seeded')
}

module.exports = deviceSeeder
