const { CronJob } = require('cron')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')

const deviceHandler = new DeviceHandler()

const saveDb = new CronJob('0 */1 * * * *', async () => {
    try {
        const data = deviceHandler.datas
        const tagNameSave = await TagnameModel.find({ isSaveDb: true }).select({
            _id: 1,
        })
        const savedIds = new Set(tagNameSave.map((item) => item._id.toString()))

        const dataToSave = {}
        for (const key in data) {
            if (savedIds.has(key)) {
                dataToSave[key] = data[key]
            }
        }
        if (Object.keys(dataToSave).length === 0) return // Không có data thì return
        await ValueModel.create({ values: dataToSave })
    } catch (err) {
        console.error('❌ Lỗi khi lưu dữ liệu:', err)
    }
})

saveDb.start()
