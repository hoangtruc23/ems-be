const DeviceHandler = require('../device/deviceHandler')
const DeviceModel = require('../models/device')
const deviceHandler = new DeviceHandler()

const normalizeDeviceUpdatePayload = async (deviceId, devicePayload) => {
    const currentDevice = await DeviceModel.findById(deviceId).lean()
    const existingConfig =
        currentDevice?.config && typeof currentDevice.config === 'object'
            ? currentDevice.config
            : {}

    const normalizedConfig = { ...existingConfig }
    const payload = { ...devicePayload }

    if (payload.config && typeof payload.config === 'object') {
        Object.assign(normalizedConfig, payload.config)
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'host')) {
        normalizedConfig.host = payload.host
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'ip')) {
        normalizedConfig.host = payload.ip
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'port')) {
        normalizedConfig.port = payload.port
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'slaveId')) {
        normalizedConfig.slaveId = payload.slaveId
    }

    const { config, host, ip, port, slaveId, ...restPayload } = payload
    const normalizedPayload = { ...restPayload }

    if (payload.config !== undefined || Object.keys(normalizedConfig).length > 0) {
        normalizedPayload.config = normalizedConfig
    }

    return normalizedPayload
}

const deviceService = {
    getList: async () => {
        try {
            const data = await DeviceModel.find(
                {},
                { _id: 1, deviceName: 1 },
            )
                .sort({ deviceName: 1 })
                .lean()

            return [
                { _id: 'all', deviceName: 'All' },
                ...data,
            ]
        } catch (error) {
            throw error
        }
    },
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
    getDeviceStats: async () => {
        try {
            const [devices, connectedDevices] = await Promise.all([
                DeviceModel.find({}, { _id: 1 }).lean(),
                Promise.resolve(deviceHandler.connectionDevice || []),
            ]);

            const connectedMap = new Map(
                connectedDevices.map((item) => [
                    item.deviceId?.toString(),
                    Boolean(item.connected),
                ]),
            );

            const total = devices.length;
            const online = devices.reduce((count, device) => {
                return count + (connectedMap.get(device._id.toString()) ? 1 : 0);
            }, 0);
            const offline = total - online;

            return { online, offline, total };
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
            const normalizedPayload = await normalizeDeviceUpdatePayload(
                deviceId,
                device,
            )

            const data = await DeviceModel.findByIdAndUpdate(deviceId, normalizedPayload, {
                new: true,
            })

            await deviceHandler.disconnect(deviceId)
            await deviceHandler.connect(data)

            return data
        } catch (error) {
            throw error
        }
    },
    delete: async (deviceId) => {
        try {
            await DeviceModel.findByIdAndDelete(deviceId);
            return null
        } catch (error){
            throw error
        }
    }

}

module.exports = deviceService
