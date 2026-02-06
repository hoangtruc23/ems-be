const { Schema, model } = require('mongoose')

const configControlSchema = new Schema({
    // giới hạn nạp/xả
    p: {
        type: Number,
        required: true,
    },
    // giới hạn nạp/ xả
    dentaP: {
        type: Number,
        default: 21,
    },
    // thời gian check lại nạp/xả
    dentaT: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['charge', 'discharge'],
        required: true,
    },
    //Bật / Tắt
    isEnable: {
        type: Boolean,
        required: true,
    },
})

const ConfigControlModel = model(
    'configControl',
    configControlSchema,
    'configControl',
)

module.exports = ConfigControlModel
