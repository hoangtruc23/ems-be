const TagnameModel = require('../models/tagname')

const tagNameService = {
    getAll: async () => {
        try {
            const data = await TagnameModel.find(
                {},
                { __v: 0, isSaveDb: 0, isSendFtp: 0 },
            )
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (data) => {
        try {
            // const { name, symbol, functionCode, address, bit, dataType, unit, offset, gain, deviceId, isSaveDb, isSendFtp, note } = data

            await TagnameModel.create(data)

            return null
        } catch (error) {
            throw error
        }
    },
}

module.exports = tagNameService
