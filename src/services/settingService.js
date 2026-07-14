const BadReq = require('../utils/response/requestError')
const errorCode = require('../utils/response/errorCode')
const SettingModel = require('../models/setting')

const settingService = {
    getAll: () => {
        try {
            const data = SettingModel.findOne({})
            return data
        } catch (error) {
            throw error
        }
    },
    update: async (bodyData, fileData) => {
        try {
            const updateFields = {}

            if (bodyData.nameSoftware) {
                updateFields.nameSoftware = bodyData.nameSoftware
            }

            if (fileData) {
                updateFields.logo = fileData.buffer
                updateFields.logoContentType = fileData.mimetype
            }

            const result = await SettingModel.findOneAndUpdate(
                {},
                updateFields,
                {
                    new: true,
                    upsert: true,
                    setOnInsert: { nameSoftware: bodyData.nameSoftware || "Default Name" }
                },
            )

            return result
        } catch (error) {
            throw error
        }
    },
    getLogoData: async () => {
        try {
            const setting = await SettingModel.findOne({})
            if (!setting || !setting.logo) {
                throw new BadReq(errorCode.LOGO_NOT_FOUND)
            }
            return {
                logo: setting.logo,
                contentType: setting.logoContentType || 'image/png'
            }
        } catch (error) {
            throw error
        }
    }
}

module.exports = settingService
