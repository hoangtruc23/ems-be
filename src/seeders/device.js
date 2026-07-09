const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')

async function deviceSeeder() {
    await DeviceModel.deleteMany({})
    await DeviceModel.insertMany([
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0a'),
            deviceCode: 'BESS_01',
            deviceName: 'BESS',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: {
                host: '192.168.1.96',
                port: 502,
                slaveId: 1,
            },
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0b'),
            deviceCode: 'GATEWAY_01',
            deviceName: 'Gateway',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: {
                host: '192.168.1.97',
                port: 502,
                slaveId: 1,
            },
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0c'),
            deviceCode: 'METER_01',
            deviceName: 'Meter',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: {
                host: '192.168.1.98',
                port: 502,
                slaveId: 1,
            },
            isEnable: false,
        },
    ])
    logger.info('DeviceSeeder seeded')
}

module.exports = deviceSeeder
