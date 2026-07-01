const { Schema, model } = require('mongoose')

const alarmSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
        default: Date.now 
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
        enum: [0, 1, 2],
        default: 0,
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
