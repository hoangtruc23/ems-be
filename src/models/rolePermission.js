const { Schema, model, Types } = require('mongoose')

const rolePermissionSchema = new Schema({
    roleId: {
        type: Types.ObjectId,
        ref: 'roles',
        required: true,
    },
    permissionId: {
        type: Types.ObjectId,
        ref: 'permissions',
        required: true,
    },
})

const RolePermissionModel = model(
    'rolePermissions',
    rolePermissionSchema,
    'rolePermissions',
)

module.exports = RolePermissionModel
