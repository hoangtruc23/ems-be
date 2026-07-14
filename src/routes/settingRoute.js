const express = require('express')
const multer = require('multer')
const settingController = require('../controllers/settingController');
const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận định dạng ảnh!'));
        }
    }
});


router.get('/getAll', settingController.getAll)
router.post('/update', upload.single('filelogo'), settingController.update)
router.get('/logo', settingController.getLogo)
module.exports = router
