const controlHistoryService = require('../services/controlHistoryService')
const response = require('../utils/response/response')

const controlHistoryController = {
    getAll: async (req, res, next) => {
        try {
            const result = await controlHistoryService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await controlHistoryService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await controlHistoryService.update()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = controlHistoryController
