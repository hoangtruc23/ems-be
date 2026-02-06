const express = require('express')
const valueController = require('../controllers/valueController')
const router = express.Router()

router.get('/getAll', valueController.getAll)

module.exports = router
