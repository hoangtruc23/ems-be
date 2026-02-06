const configFtpService = require('../services/configFtpService')
const response = require('../utils/response/response')

const configFtpController = {
    getAll: async (req, res, next) => {
        try {
            const result = await configFtpService.getAll()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await configFtpService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { ftpId } = req.params
            const result = await configFtpService.update(ftpId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { ftpIds } = req.body
            const result = await configFtpService.delete(ftpIds)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = configFtpController
