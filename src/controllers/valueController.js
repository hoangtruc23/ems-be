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
    chartAggregatedLoad: async (req, res, next) => {
        try {
            const result = await valueService.chartAggregatedLoad(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    trendPowerAnalysis: async (req, res, next) => {
        try {
            const result = await valueService.trendPowerAnalysis(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    meterSummary: async (req, res, next) => {
        try {
            const result = await valueService.meterSummary(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    chartTotalLoad: async (req, res, next) => {
        try {
            const result = await valueService.chartTotalLoad(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = valueController
