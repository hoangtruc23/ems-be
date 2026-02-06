const { Schema, model, Types } = require('mongoose')

const permissionApiSchema = new Schema({
    permissionId: {
        type: Types.ObjectId,
        ref: 'permissions',
        required: true,
    },
    apiId: {
        type: Types.ObjectId,
        ref: 'apis',
        required: true,
    },
})

const PermissionApiModel = model(
    'permissionApis',
    permissionApiSchema,
    'permissionApis',
)

module.exports = PermissionApiModel
