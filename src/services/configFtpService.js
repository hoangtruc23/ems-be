const ConfigFtpModel = require('../models/configFtp')

const configFtpService = {
    getAll: async () => {
        try {
            const data = await ConfigFtpModel.find()
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (ftp) => {
        try {
            const data = await ConfigFtpModel.create(ftp)
            return data
        } catch (error) {
            throw error
        }
    },
    update: async (ftpId, ftp) => {
        try {
            const data = await ConfigFtpModel.findByIdAndUpdate(ftpId, ftp, {
                new: true,
            })
            return data
        } catch (error) {
            throw error
        }
    },
    delete: async (ftpIds) => {
        try {
            await ConfigFtpModel.findByIdAndDelete(ftpIds)
            return null
        } catch (error) {
            throw error
        }
    },
}

module.exports = configFtpService
