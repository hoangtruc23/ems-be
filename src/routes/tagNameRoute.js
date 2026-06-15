const express = require('express')
const tagNameController = require('../controllers/tagNameController')
const { validate } = require('../models/tagname')
const router = express.Router()

router.get('/getAll', tagNameController.getAll)
router.get('/getByDevice/:deviceId', tagNameController.getByDevice)
router.post('/create', tagNameController.create)
router.post('/update/:tagId', tagNameController.update)
router.get('/delete/:tagId', tagNameController.delete)

module.exports = router
