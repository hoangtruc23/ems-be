const express = require('express')
const deviceController = require('../controllers/deviceController')
const router = express.Router()

router.get('/list', deviceController.getList)
router.get('/getAll', deviceController.getAll)
router.get('/getAllLocation', deviceController.getAllLocation)
router.post('/create', deviceController.create)
router.post('/update/:deviceId', deviceController.update)
router.delete('/delete/:deviceId', deviceController.delete)
router.get('/counters', deviceController.getDeviceStats);
module.exports = router
