const express = require('express')
const valueController = require('../controllers/valueController')
const router = express.Router()

router.get('/getAll', valueController.getAll)
router.get('/chartAggregatedLoad', valueController.chartAggregatedLoad)
router.get('/trendPowerAnalysis', valueController.trendPowerAnalysis)
router.get('/meterSummary', valueController.meterSummary)
router.get('/chartTotalLoad', valueController.chartTotalLoad)
router.get('/monthlyEnergyConsumption', valueController.monthlyEnergyConsumption)

module.exports = router
