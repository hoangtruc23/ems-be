const fs = require('fs').promises
const path = require('path')
const { CronJob } = require('cron')
const moment = require('moment-timezone')

const ConfigFtpModel = require('../models/configFtp')
const uploadFile = require('../ftp/uploadFtp')
const { logger } = require('../config/loggerConfig')
const { fileNameFtpConstant } = require('../utils/constant/ftpConstant')

const sendFtp = async () => {
    try {
        const config = await ConfigFtpModel.findOne()
        if (!config) {
            logger.error('Không tìm thấy thông tin SFTP')
        }
        const dir = path.resolve(process.cwd(), 'storages/ftpFile')
        const files = fileNameFtpConstant
        const job30Min = new CronJob(`0 */30 * * * *`, async () => {
            try {
                const now = moment().tz('Asia/Ho_Chi_Minh')
                const dateStr = now.format('YYYY-MM-DD')

                const filePath = path.join(
                    dir,
                    `${dateStr}_${files[0]}.${config?.fileType || 'CSV'}`,
                )
                const uploadPath = `/${config.folderName}/${dateStr}_${files[0]}.${config?.fileType || 'CSV'}`
                await uploadFile(config, filePath, uploadPath)

                // if (filePath) {
                //     try {
                //         await fs.unlink(filePath)
                //         logger.info(`Đã xóa file: ${filePath}`)
                //     } catch (err) {
                //         logger.error(
                //             `Không thể xóa file ${filePath}:`,
                //             err.message,
                //         )
                //     }
                // }
            } catch (error) {
                logger.error('Lỗi upload ftp ' + error)
            }
        })
        job30Min.start()

        const jobDaily = new CronJob(`0 0 1 * * *`, async () => {
            try {
                // const now = moment().tz('Asia/Ho_Chi_Minh')
                // const dateStr = now.format('YYYY-MM-DD')

                const yesterday = moment()
                    .tz('Asia/Ho_Chi_Minh')
                    .subtract(1, 'days')
                const dateStr = yesterday.format('YYYY-MM-DD')
                const filePath = path.join(
                    dir,
                    `${dateStr}_${files[0]}.${config?.fileType || 'CSV'}`,
                )
                const uploadPath = `/${config.folderName}/${dateStr}_${files[0]}.${config?.fileType || 'CSV'}`

                await uploadFile(config, filePath, uploadPath)
            } catch (error) {
                logger.error('Lỗi upload ftp ' + error)
            }
        })
        jobDaily.start()
    } catch (error) {
        logger.error('sendFtp lỗi!')
        logger.error(error)
    }
}

module.exports = sendFtp
