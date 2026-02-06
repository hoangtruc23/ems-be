const express = require('express')
const deviceController = require('../controllers/deviceController')
const router = express.Router()

router.get('/getAll', deviceController.getAll)
router.post('/update/:deviceId', deviceController.update)

module.exports = router
