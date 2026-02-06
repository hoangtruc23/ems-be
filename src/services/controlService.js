const { clearCronControl, runControlSchedule } = require('../cron/control')
const ControlModel = require('../models/control')
const ControlHistoryModel = require('../models/controlHistory')
const errorCode = require('../utils/response/errorCode')
const BadReq = require('../utils/response/requestError')

const controlService = {
    getAll: async (query) => {
        try {
            const data = await ControlModel.find()
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (control) => {
        try {
            const data = await ControlModel.create(control)

            runControlSchedule(data)

            return data
        } catch (error) {
            throw error
        }
    },
    update: async (controlId, control) => {
        try {
            const data = await ControlModel.findByIdAndUpdate(
                controlId,
                control,
                {
                    new: true,
                },
            )

            if (!data?.isEnable) {
                clearCronControl(controlId)
            } else {
                runControlSchedule(data)
            }

            return data
        } catch (error) {
            throw error
        }
    },
    delete: async (controlIds) => {
        try {
            if (!Array.isArray(controlIds) || controlIds.length === 0) {
                throw new BadReq(errorCode.CONTROL_NOT_ARRAY)
            }

            await ControlModel.deleteMany({ _id: { $in: controlIds } })

            controlIds.forEach((id) => {
                clearCronControl(id)
            })

            return null
        } catch (error) {
            throw error
        }
    },
}

module.exports = controlService
