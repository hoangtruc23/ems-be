const express = require('express')
const tagNameController = require('../controllers/tagNameController')
const validation = require('../validations/tagname.validation')
const router = express.Router()

router.get('/getAll', tagNameController.getAll)
router.post('/create', validate(validation.tagnameSchema), tagNameController.create)

module.exports = router
