const express = require('express')
const controlController = require('../controllers/controlController')
const controlConfigController = require('../controllers/controlConfigController')
const router = express.Router()

router.get('/getInfo', controlConfigController.getInfo)
router.post('/updateInfo', controlConfigController.update)

router.get('/getAll', controlController.getAll)
router.post('/create', controlController.create)
router.put('/update/:controlId', controlController.update)
router.post('/delete', controlController.delete)

module.exports = router
