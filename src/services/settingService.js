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
    update: async (data) => {
        try {

            const result = await SettingModel.findOneAndUpdate({},
                {
                    nameSoftware: data.nameSoftware
                },
                {
                    new: true
                },
            )
            return result
        } catch (error) {
            throw error
        }
    },
}

module.exports = settingService
