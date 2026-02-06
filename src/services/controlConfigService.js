const ControlModel = require('../models/control')
const ControlConfigModel = require('../models/controlConfig')

const controlConfigService = {
    getInfo: async (req, res, next) => {
        try {
            const result = await ControlConfigModel.findOne().lean()
            return result
        } catch (error) {
            throw error
        }
    },
    update: async (controlConfig) => {
        try {
            const { controlMode } = controlConfig
            if (controlMode == 'manual') {
                await ControlModel.updateMany({}, { isEnable: false })
            }
            const data = await ControlConfigModel.findOneAndUpdate(
                {},
                { controlMode },
                { new: true },
            )
            return data
        } catch (error) {
            throw error
        }
    },
}

module.exports = controlConfigService
