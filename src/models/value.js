const { Schema, model } = require('mongoose')

const valueSchema = new Schema(
    {
        values: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

const ValueModel = model('values', valueSchema, 'values')

module.exports = ValueModel
