const express = require('express')
const alarmController = require('../controllers/alarmController')
const router = express.Router()

router.get('/getAll', alarmController.getAll)
router.get('/update/:alarmId', alarmController.update)

module.exports = router
