const express = require('express')
const controlHistoryController = require('../controllers/controlHistoryController')
const router = express.Router()

router.get('/getAll', controlHistoryController.getAll)
router.post('/create', controlHistoryController.create)
router.get('/update', controlHistoryController.update)

module.exports = router
