const DeviceHandler = require('../device/deviceHandler')
const DeviceModel = require('../models/device')
const deviceHandler = new DeviceHandler()
const deviceService = {
    getAll: async (query) => {
        try {
            let { page, limit, search, location } = query
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;

            search = new RegExp(search, 'i')
            let queryDB = { deviceName: search }
            if (location) {
                queryDB.location = location
            }

            const [data, total] = await Promise.all([
                DeviceModel.find(queryDB, { __v: 0 })
                    .collation({ locale: "en", numericOrdering: true })
                    .sort({ deviceName: 1 })
                    .skip(skip)
                    .limit(limit),
                DeviceModel.countDocuments({})
            ]);

            const result = {
                data: data,
                total,
                limit,
                totalPages: Math.ceil(total / limit)
            }

            return result
        } catch (error) {
            throw error;
        }
    },
    getAllLocation: async () => {
        try {
            // let { location } = query
            // const filter = {};
            // if (location) {
            //     filter.location = new RegExp(location, 'i');
            // }
            const locationList = await DeviceModel.distinct('location');
            return locationList
        }
        catch (error) {
            throw error
        }
    },
    create: async (device) => {
        try {
            const { deviceCode, deviceName, location, protocol, config, isEnable } = device

            await DeviceModel.create({ deviceCode, deviceName, location, protocol, config, isEnable })

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
