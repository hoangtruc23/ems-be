const roleService = require('../services/roleService')
const settingService = require('../services/settingService')
const response = require('../utils/response/response')

const settingController = {
    getAll: async (req, res, next) => {
        try {
            const result = await settingService.getAll()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await settingService.update(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = settingController
