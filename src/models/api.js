const { Schema, model } = require('mongoose')

const apiSchema = new Schema({
    api: {
        type: String,
        required: true,
        unique: true,
    },
    note: {
        type: String,
    },
})

const ApiModel = model('apis', apiSchema, 'apis')

module.exports = ApiModel
