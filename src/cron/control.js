const { CronJob } = require('cron')
const ControlModel = require('../models/control')
const { logger } = require('../config/loggerConfig')
const controlHistoryService = require('../services/controlHistoryService')
const DeviceHandler = require('../device/deviceHandler')
const { controlConstant } = require('../utils/constant/controlConstant')

const dayToCronDay = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
}

const cronMap = new Map()

const controlSchedule = async () => {
    try {
        const controls = await ControlModel.find({ isEnable: true })
        controls.forEach(runControlSchedule)
    } catch (err) {
        logger.error('Lỗi chạy controlSchedule: ' + err)
    }
}

const deviceHandler = new DeviceHandler()

const formatTimeControl = (timeStr) => {
    if (!timeStr.includes('T')) {
        return timeStr.split(':')
    }

    try {
        const date = new Date(timeStr)

        const options = {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }

        // Định dạng và tách thành [Giờ, Phút]
        return new Intl.DateTimeFormat('vi-VN', options).format(date).split(':')
    } catch (error) {
        console.error('Lỗi formatTimeControl: ', timeStr, error)
        return ['00', '00']
    }
}

const runControlSchedule = async (control) => {
    try {
        clearCronControl(control.id)
        const day = control.day.toLowerCase()
        const dayOfWeek = dayToCronDay[day]
        // const [startHour, startMinute] = control.startTime.split(':')
        const [startHour, startMinute] = formatTimeControl(control.startTime)

        const cronTime = `0 ${startMinute} ${startHour} * * ${dayOfWeek}`
        const startJob = new CronJob(
            cronTime,
            async () => {
                // CHECK gensetStatus = 1 THÌ KHÔNG CHẠY SCHEDULE NÀY
                const gensetStatus = await deviceHandler.readSingleData(
                    Number(controlConstant.ADDRESS_GENSET_STATUS),
                    1,
                )
                if (gensetStatus && gensetStatus === 1) {
                    return
                }

                const startTime = new Date()
                try {
                    await controlHistoryService.create({
                        startTime,
                        power: control.power,
                        action: control.action,
                        type: 'auto',
                    })
                } catch (err) {
                    throw err
                }
            },
            null,
            true, // start ngay lập tức
            'Asia/Ho_Chi_Minh',
        )

        cronMap.set(`${control.id}-start`, startJob)

        // const [endHour, endMinute] = control.endTime.split(':')
        const [endHour, endMinute] = formatTimeControl(control.endTime)
        const cronTimeEnd = `0 ${endMinute} ${endHour} * * ${dayOfWeek}`

        const endJob = new CronJob(
            cronTimeEnd,
            async () => {
                const gensetStatus = await deviceHandler.readSingleData(
                    Number(controlConstant.ADDRESS_GENSET_STATUS),
                    1,
                )
                if (gensetStatus && gensetStatus === 1) {
                    return
                }
                try {
                    await controlHistoryService.update()
                } catch (err) {
                    throw err
                }
            },
            null,
            true, // start ngay lập tức
            'Asia/Ho_Chi_Minh',
        )
        cronMap.set(`${control.id}-end`, endJob)
    } catch (err) {
        logger.error('Lỗi chạy Cron control: ' + err)
    }
}

const logCronJobs = () => {
    console.log('\n📋 Danh sách cron jobs đang được lên lịch:')
    if (cronMap.size === 0) {
        console.log('⚠️ Không có cron nào đang được lên lịch.')
        return
    }

    for (const [key, job] of cronMap.entries()) {
        console.log(`• ${key} → Lịch: "${job.cronTime.source}"`)
    }
}

const clearCronControl = (controlId) => {
    ;['start', 'end'].forEach((type) => {
        const key = `${controlId}-${type}`
        if (cronMap.has(key)) {
            const job = cronMap.get(key)

            job.stop() //Dừng cron
            logger.info(`🧹 Đã stop cron: ${key}`)

            cronMap.delete(key) //Xoá khỏi Map
        }
    })
}
;(() => {
    try {
        controlSchedule()
    } catch (error) {
        logger.error('controlSchedule lỗi!')
        logger.error(error)
    }
})()

module.exports = { runControlSchedule, clearCronControl, logCronJobs }
