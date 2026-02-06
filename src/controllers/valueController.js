const valueService = require('../services/valueService')
const response = require('../utils/response/response')

const valueController = {
    getAll: async (req, res, next) => {
        try {
            const result = await valueService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = valueController
