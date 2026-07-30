const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')

async function deviceSeeder() {
    await DeviceModel.deleteMany({})
    await DeviceModel.insertMany([
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0a'),
<<<<<<< HEAD
            deviceCode: 'BESS_01',
            deviceName: 'BESS',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: {
                host: '192.168.1.96',
                port: 502,
                slaveId: 1,
            },
=======
            deviceCode: "BESS",
            deviceName: 'BESS',
            location: 'HCM',
            protocol: 'modbus_tcp',
            config: { host: '192.168.1.39', port: '502' },
            slaveId: 1,
>>>>>>> 5dc237b6b5e90f3925beb6100021175e1ab74758
            isEnable: false,
        },
        {
            _id: new Types.ObjectId('684bcaeb7cac1b319680bf0b'),
<<<<<<< HEAD
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
=======
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
>>>>>>> 5dc237b6b5e90f3925beb6100021175e1ab74758
            isEnable: false,
        },
    ])
    logger.info('DeviceSeeder seeded')
}

module.exports = deviceSeeder