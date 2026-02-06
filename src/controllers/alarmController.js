const alarmService = require('../services/alarmService')
const response = require('../utils/response/response')
const alarmController = {
    getAll: async (req, res, next) => {
        try {
            const result = await alarmService.getAll(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { alarmId } = req.params
            const result = await alarmService.update(alarmId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = alarmController
