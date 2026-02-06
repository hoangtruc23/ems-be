const { logger } = require('../config/loggerConfig')
const Client = require('ssh2-sftp-client')

const uploadFile = async (config, localPath, uploadPath) => {
    const sftp = new Client()
    try {
        await sftp.connect({
            host: config.host,
            port: config.port ?? 22,
            username: config.username,
            password: config.password,
        })
        // await sftp.put(localPath, uploadPath)
        await sftp.fastPut(localPath, uploadPath)
        logger.info('Upload SFTP successfully: ' + uploadPath)
    } catch (err) {
        logger.error('SFTP upload error: ' + err.message)
    } finally {
        await sftp.end()
    }
}

module.exports = uploadFile
