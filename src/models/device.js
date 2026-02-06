const { Schema, model } = require('mongoose')

const deviceSchema = new Schema({
    deviceName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    host: {
        type: String,
        default: null,
    },
    port: {
        type: String,
        default: null,
    },
    slaveId: {
        type: Number,
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
