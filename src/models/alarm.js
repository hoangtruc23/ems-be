const { Schema, model } = require('mongoose')

const alarmSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
    },
    severity: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['resolved', 'unResolved'],
        default: 'unResolved',
        required: true,
    },
    value: {
        type: String,
    },
})

const AlarmModel = model('alarms', alarmSchema, 'alarms')

module.exports = AlarmModel
