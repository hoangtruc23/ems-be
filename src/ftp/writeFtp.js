const fs = require('fs').promises
const moment = require('moment-timezone')
const { logger } = require('../config/loggerConfig')
const writeFtp = async (headers, values, filePath) => {
    try {
        const now = moment().tz('Asia/Ho_Chi_Minh')
        const dateTime = now.format('YYYY-MM-DD HH:mm:ss')
        // const csvRow = [dateTime, ...values].join(',')
        const csvRow = [dateTime, ...values].join(';')

        // Nội dung file
        let csvContent = ''
        if (headers == null) {
            csvContent = `${csvRow}`
        } else {
            csvContent = `${headers}\n${csvRow}`
        }

        let exists = true
        try {
            await fs.access(filePath)
        } catch {
            exists = false
        }

        if (!exists) {
            await fs.writeFile(filePath, `${csvContent}\n`, 'utf8')
        } else {
            await fs.appendFile(filePath, `${csvRow}\n`, 'utf8')
        }
    } catch (error) {
        logger.error('writeFtp')
        logger.error(error)
    }
}

module.exports = writeFtp
