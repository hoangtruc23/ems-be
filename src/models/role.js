const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    note: {
        type: String,
    },
})

const RoleModel = model('roles', roleSchema, 'roles')

module.exports = RoleModel
