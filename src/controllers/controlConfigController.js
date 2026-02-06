const controlConfigService = require('../services/controlConfigService')
const response = require('../utils/response/response')

const controlConfigController = {
    getInfo: async (req, res, next) => {
        try {
            const result = await controlConfigService.getInfo()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await controlConfigService.update(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = controlConfigController
