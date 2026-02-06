const controlService = require('../services/controlService')
const response = require('../utils/response/response')

const controlController = {
    getAll: async (req, res, next) => {
        try {
            const result = await controlService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await controlService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { controlId } = req.params
            const result = await controlService.update(controlId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { controlIds } = req.body
            const result = await controlService.delete(controlIds)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = controlController
