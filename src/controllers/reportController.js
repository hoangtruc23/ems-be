const reportService = require('../services/reportService')
const response = require('../utils/response/response')
const moment = require('moment-timezone')

const reportController = {
    getChartDashboard: async (req, res, next) => {
        try {
            const result = await reportService.getChartDashboard(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    chartMonitoring: async (req, res, next) => {
        try {
            const result = await reportService.chartMonitoring(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getAll: async (req, res, next) => {
        try {
            const result = await reportService.getDataControlChart(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    controlTable: async (req, res, next) => {
        try {
            const result = await reportService.controlTable(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    generateChart: async (req, res, next) => {
        try {
            const result = await reportService.generateChart(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    generateTableReport: async (req, res, next) => {
        try {
            const result = await reportService.generateTableReport(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },

    //GRID
    getChartVoltage: async (req, res, next) => {
        try {
            const result = await reportService.getChartVoltage()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = reportController
