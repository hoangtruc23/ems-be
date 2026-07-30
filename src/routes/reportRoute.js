const express = require('express')
const reportController = require('../controllers/reportController')
const downloadController = require('../controllers/downloadController')
const router = express.Router()

router.get('/energy', reportController.getEnergyReport)
router.get('/getChartDashboard', reportController.getChartDashboard)
router.get('/chartMonitoring', reportController.chartMonitoring)
router.get('/daily/charts', reportController.getDailyEnergyCharts)
router.get('/daily/meters-table', reportController.getDailyMetersTable)
router.get('/daily/alarms', reportController.getDailyAlarms)
router.get('/getDataControlChart', reportController.getAll)
router.get('/controlTable', reportController.controlTable)
router.get('/generateChart', reportController.generateChart)
router.get('/generateTable', reportController.generateTableReport)

router.get('/downloadGenerateTable', downloadController.downloadGenerateTable)

//GRID
router.get('/getChartGridVoltage', reportController.getChartVoltage)

module.exports = router
