const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')

async function deviceSeeder() {
    await DeviceModel.deleteMany({})
    await DeviceModel.insertMany([
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0a'),
            deviceCode: "BESS",
            deviceName: 'BESS',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: { host: '192.168.1.39', port: '502' },
            slaveId: 1,
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0b'),
            deviceCode: "Gateway 01",
            deviceName: 'Gateway',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: { host: '192.168.1.39', port: '502' },
            slaveId: 1,
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0d'),
            deviceCode: "MQTT_01",
            deviceName: 'MQTT',
            location: 'HCM',
            protocol: 'mqtt',
            // config: { host: '192.168.1.39', port: '1883' },
            config: { host: 'localhost', port: '1883' },
            slaveId: 1,
            isEnable: false,
        },
    ])
    logger.info('DeviceSeeder seeded')
}

module.exports = deviceSeeder
