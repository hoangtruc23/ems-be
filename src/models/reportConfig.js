const { Schema, model } = require('mongoose')

const reportConfigSchema = new Schema(
    {
        tariff: {
            type: Number,
            required: true,
            default: 0,
        },
        savingEnergy: {
            type: Number,
            required: true,
            default: 0,
        },
        threshold: {
            type: Number,
            required: true,
            default: 0,
        },
        emissionFactor: {
            type: Number,
            required: true,
            default: 0.6592,
        },
        energyTagName: {
            type: String,
            required: true,
            default: 'gridTotal',
        },
        demandTagName: {
            type: String,
            required: true,
            default: 'demandPower',
        },
        pfTagName: {
            type: String,
            required: true,
            default: 'gridPowerFactor',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
)

const ReportConfigModel = model('reportConfig', reportConfigSchema, 'reportConfig')

module.exports = ReportConfigModel
