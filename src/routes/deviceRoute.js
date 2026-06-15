const express = require('express')
const deviceController = require('../controllers/deviceController')
const router = express.Router()

router.get('/getAll', deviceController.getAll)
router.get('/getAllLocation', deviceController.getAllLocation)
router.post('/create', deviceController.create)
router.post('/update/:deviceId', deviceController.update)

module.exports = router
