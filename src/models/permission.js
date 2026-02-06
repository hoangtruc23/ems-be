const { Schema, model, Types } = require('mongoose')

const permissionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    parentPermissionId: {
        type: Types.ObjectId,
        ref: 'permissions',
    },
})

const PermissionModel = model('permissions', permissionSchema, 'permissions')

module.exports = PermissionModel
