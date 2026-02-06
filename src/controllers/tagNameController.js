const tagNameService = require('../services/tagNameService')
const response = require('../utils/response/response')

const tagNameController = {
    getAll: async (req, res, next) => {
        try {
            const result = await tagNameService.getAll()
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
    }
}

module.exports = tagNameController
