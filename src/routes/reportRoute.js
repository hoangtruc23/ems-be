const express = require('express')
const reportController = require('../controllers/reportController')
const downloadController = require('../controllers/downloadController')
const router = express.Router()

router.get('/getChartDashboard', reportController.getChartDashboard)
router.get('/chartMonitoring', reportController.chartMonitoring)
router.get('/getDataControlChart', reportController.getAll)
router.get('/controlTable', reportController.controlTable)
router.get('/generateChart', reportController.generateChart)
router.get('/generateTable', reportController.generateTableReport)

router.get('/downloadGenerateTable', downloadController.downloadGenerateTable)

//GRID
router.get('/getChartGridVoltage', reportController.getChartVoltage)

module.exports = router
