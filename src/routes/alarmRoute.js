const express = require('express')
const alarmController = require('../controllers/alarmController')
const router = express.Router()

router.get('/getAll', alarmController.getAll)
router.put('/update/:alarmId', alarmController.update)
router.post('/create', alarmController.create)
router.put('/resolve/:alarmId', alarmController.resolve)
module.exports = router
