const { Schema, model } = require('mongoose')
const constant = require('../utils/constant/constant')

const controlHistorySchema = new Schema({
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: false,
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
})

const ControlHistoryModel = model(
    'controlHistory',
    controlHistorySchema,
    'controlHistory',
)

module.exports = ControlHistoryModel
