const ConfigControlModel = require('../models/configControl')

const configControlService = {
    getAll: async () => {
        try {
            const data = await ConfigControlModel.find({})
            return data
        } catch (error) {
            throw error
        }
    },
    update: async (data) => {
        try {
            const { p, dentaP, dentaT, isEnable, type } = data
            const result = await ConfigControlModel.findOneAndUpdate(
                { type },
                { p, dentaP, dentaT, isEnable },
                {
                    new: true,
                },
            )
            return result
        } catch (error) {
            throw error
        }
    },
}

module.exports = configControlService
