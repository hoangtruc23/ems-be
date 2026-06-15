const { Schema, model, Types } = require('mongoose')

const settingSchema = new Schema({
    nameSoftware: {
        type: String,
        required: true,
        unique: true,
    },
    note: {
        type: String,
    },
    logo: {
        type: Buffer,
        required: false,
    },
})

const SettingModel = model('settings', settingSchema, 'settings')

module.exports = SettingModel
