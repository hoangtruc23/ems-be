const response = require('../utils/response/response')
const configControlService = require('../services/configControlService')

const configControlController = {
    getAll: async (req, res, next) => {
        try {
            const result = await configControlService.getAll()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await configControlService.update(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = configControlController
