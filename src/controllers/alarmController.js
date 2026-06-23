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
    create: async (req, res, next) => {
        try {
            const newAlarm = req.body;

            const result = await alarmService.create(newAlarm);
            return res.status(201).json(response.success(result));
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { alarmId } = req.params
            const { status } = req.body
            const result = await alarmService.update(alarmId, status)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    resolve: async (req, res, next) => {
        try {
            const { alarmId } = req.params
            const result = await alarmService.resolve(alarmId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = alarmController
