const express = require('express')
const { validate } = require('../models/tagname')
const settingController = require('../controllers/settingController')
const router = express.Router()

router.get('/getAll', settingController.getAll)
router.post('/update', settingController.update)

module.exports = router
