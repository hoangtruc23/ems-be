const deviceService = require('../services/deviceService')
const response = require('../utils/response/response')

const deviceController = {
    getAll: async (req, res, next) => {
        try {
            const result = await deviceService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await deviceService.update(req.params, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = deviceController
