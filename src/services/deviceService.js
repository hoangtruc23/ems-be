const DeviceHandler = require('../device/deviceHandler')
const DeviceModel = require('../models/device')
const deviceHandler = new DeviceHandler()
const deviceService = {
    getAll: async () => {
        try {
            const data = await DeviceModel.find({}, { __v: 0 })
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (device) => {
        try {
            const { deviceName, location, host, port, slaveId, isEnable } = device

            await DeviceModel.create({ deviceName, location, host, port, slaveId, isEnable })

            return null
        } catch (error) {
            throw error
        }
    },
    update: async (param, device) => {
        try {
            const { deviceId } = param
            const data = await DeviceModel.findByIdAndUpdate(deviceId, device, {
                new: true,
            })

            deviceHandler.connect(deviceId)

            return data
        } catch (error) {
            throw error
        }
    },
}

module.exports = deviceService
