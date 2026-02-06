const roleService = require('../services/roleService')
const response = require('../utils/response/response')

const roleController = {
    getAll: async (req, res, next) => {
        try {
            const result = await roleService.getAll()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getDetail: async (req, res, next) => {
        try {
            const { roleId } = req.params
            const result = await roleService.getDetail(roleId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { roleId } = req.params
            const result = await roleService.update(roleId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    assignPermissions: async (req, res, next) => {
        try {
            const result = await roleService.assignPermissions(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { roleId } = req.params
            const result = await roleService.delete(roleId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = roleController
