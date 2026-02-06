const RoleModel = require('../models/role')
const errorCode = require('../utils/response/errorCode')
const BadReq = require('../utils/response/requestError')
const RolePermissionModel = require('../models/rolePermission')

const roleService = {
    getAll: async () => {
        try {
            const data = await RoleModel.find()
            return data
        } catch (error) {
            throw error
        }
    },
    getDetail: async (roleId) => {
        try {
            const data = await RoleModel.findById(roleId)
            return data
        } catch (error) {
            throw error
        }
    },
    update: async (roleId, role) => {
        try {
            const { name, note } = role
            const data = await RoleModel.findByIdAndUpdate(
                roleId,
                {
                    name,
                    note,
                },
                { new: true },
            )
            return data
        } catch (error) {
            throw error
        }
    },
    delete: async (roleId) => {
        try {
            const data = await RoleModel.findById(roleId)
            if (!data) {
                throw new BadReq(errorCode.ROLE_NOT_FOUND)
            }
            await RoleModel.findByIdAndDelete(roleId)
            return
        } catch (error) {
            throw error
        }
    },
}

module.exports = roleService
