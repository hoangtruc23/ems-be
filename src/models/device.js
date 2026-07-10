const { Schema, model } = require('mongoose')

const deviceSchema = new Schema({
    deviceCode: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    protocol: {
        type: String,
        required: true,
        enum: ["modbus_tcp", "modbus_rtu", "siemens_s7", "mqtt"]
    },
    //845 -> RTU -> 
    config: {
        type: Schema.Types.Mixed, // config: { host: '192.168.1.23', port: 502, slaveId: 1, rack: 1, slot: 1 },
        required: true,
    },
    isEnable: {
        type: Boolean,
        required: true,
        default: false,
    },

})

const DeviceModel = model('devices', deviceSchema, 'devices')

module.exports = DeviceModel
