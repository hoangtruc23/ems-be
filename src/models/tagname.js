const { Schema, model, Types } = require('mongoose')

const tagnameSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    symbol: {
        type: String,
    },
    functionCode: {
        type: Number,
        required: true,
    },
    address: { type: Number, required: true },
    bit: {
        type: Number,
        default: null,
    },
    dataType: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        default: null,
    },
    offset: {
        type: Number,
        default: 0,
    },
    gain: {
        type: Number,
        default: 1,
    },
    deviceId: {
        type: Types.ObjectId,
        ref: 'devices',
    },
    isSaveDb: {
        type: Boolean,
    },
    isSendFtp: {
        type: Boolean,
    },
    note: {
        type: String,
    }
})

tagnameSchema.index({ deviceId: 1, name: 1 });
const TagnameModel = model('tagnames', tagnameSchema, 'tagnames')

module.exports = TagnameModel
