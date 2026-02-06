const { Schema, model } = require('mongoose')

const controlConfigSchema = new Schema({
    controlMode: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual',
        required: true,
    },
})

const ControlConfigModel = model(
    'controlConfig',
    controlConfigSchema,
    'controlConfig',
)

module.exports = ControlConfigModel
