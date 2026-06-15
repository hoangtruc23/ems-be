const { Schema, model } = require('mongoose')

const valueSchema = new Schema({
    deviceId: {
        type: Schema.Types.ObjectId,
        ref: 'devices',
        required: true,
    },
    values: [
        {
            value: [
                {
                    tagId: {
                        type: Schema.Types.ObjectId,
                        ref: 'tagnames'
                    },
                    value: { type: Schema.Types.Mixed },
                    _id: false,
                }
            ],
            ts: Number,
            _id: false,
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    },
})

valueSchema.index({ deviceId: 1, date: 1 });
const ValuesModel = model('values', valueSchema)

module.exports = ValuesModel
