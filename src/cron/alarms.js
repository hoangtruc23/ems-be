const { CronJob } = require('cron')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')
const { tagPCSAlarm, tagPCSAlarm_2 } = require('../utils/constant/tagDashboard')
const moment = require('moment')
const AlarmModel = require('../models/alarm')
const { logger } = require('../config/loggerConfig')
const deviceHandler = new DeviceHandler()

let alarmsAll = []
const alarmBESS = new CronJob('*/5 * * * * *', async () => {
    try {
        const PCS_ALARM_TAGS = [...tagPCSAlarm, ...tagPCSAlarm_2]
        const tagnameValues = await deviceHandler.getValueByName(PCS_ALARM_TAGS)
        const date = moment().tz('Asia/Ho_Chi_Minh').format('DD-MM-YY HH:mm:ss')
        await Promise.all(
            tagnameValues.map(async (tag) => {
                const checkAlarm = await AlarmModel.find({
                    name: tag.name,
                    value: tag.value,
                    status: 'unResolved',
                }).lean()
                let alarm = alarmsAll.find((a) => a.name === tag.name)
                if (!alarm && tag.value == 1) {
                    alarmsAll.push({
                        time: date,
                        name: tag.name,
                        value: tag.value,
                    })
                    if (checkAlarm.length === 0) {
                        await AlarmModel.insertOne({
                            time: date,
                            name: tag.name,
                            title: tag.symbol,
                            severity: 'PCS',
                            note: tag.note,
                            value: tag.value,
                        })
                    }
                } else if (
                    checkAlarm.length === 0 &&
                    alarm &&
                    (alarm.value !== tag.value || tag.value == 1)
                ) {
                    await AlarmModel.insertOne({
                        time: date,
                        name: tag.name,
                        title: tag.symbol,
                        severity: 'PCS',
                        note: tag.note,
                        value: tag.value,
                    })
                }
            }),
        )
    } catch (err) {
        logger.error('❌ Lỗi khi lưu alarms:', err)
    }
})

alarmBESS.start()
