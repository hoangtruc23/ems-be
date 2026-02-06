const express = require('express')
const configControlController = require('../controllers/configControlController')
const router = express.Router()

router.get('/getAll', configControlController.getAll)
router.put('/update', configControlController.update)

module.exports = router
