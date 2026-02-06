const { Schema, model } = require('mongoose')
const constant = require('../utils/constant/constant')

const controlSchema = new Schema({
    day: {
        type: String,
        enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
        ],
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    power: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        enum: [
            constant.CONTROL_VALUE_CHARGE,
            constant.CONTROL_VALUE_DIS_CHARGE,
        ],
        required: true,
    },
    isEnable: {
        type: Boolean,
        required: true,
    },
})

const ControlModel = model('controls', controlSchema, 'controls')

module.exports = ControlModel
