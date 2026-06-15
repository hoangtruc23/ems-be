const tagNameService = require('../services/tagNameService')
const response = require('../utils/response/response')

const tagNameController = {
    getAll: async (req, res, next) => {
        try {
            const result = await tagNameService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getByDevice: async (req, res, next) => {
        try {
            const { deviceId } = req.params
            const result = await tagNameService.getByDevice(deviceId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await tagNameService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { tagId } = req.params
            const result = await tagNameService.update(tagId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { tagId } = req.params
            const result = await tagNameService.delete(tagId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = tagNameController
