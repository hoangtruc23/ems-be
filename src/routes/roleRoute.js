const express = require('express')
const roleController = require('../controllers/roleController')

const router = express.Router()

router.get('/getAll', roleController.getAll)
router.get('/getDetail/:roleId', roleController.getDetail)
router.put('/update/:roleId', roleController.update)
router.post('/assignPermissions', roleController.assignPermissions)
router.delete('/delete/:roleId', roleController.delete)

module.exports = router
