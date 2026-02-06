const express = require('express')
const configFtpController = require('../controllers/configFtpController')
const router = express.Router()

router.get('/getAll', configFtpController.getAll)
router.post('/create', configFtpController.create)
router.put('/update/:ftpId', configFtpController.update)
router.post('/delete', configFtpController.delete)

module.exports = router
