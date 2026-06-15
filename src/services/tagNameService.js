const TagnameModel = require('../models/tagname')

const tagNameService = {
    getAll: async (query) => {
        try {
            let { limit = 10, page = 1, search = '', deviceId } = query
            limit = Number(limit)
            page = Number(page)
            const skip = (page - 1) * limit;

            search = new RegExp(search, 'i')
            let queryDB = { symbol: search }
            if (deviceId) {
                queryDB.deviceId = deviceId
            }

            const [data, total] = await Promise.all([
                TagnameModel.find(queryDB, { __v: 0, isSaveDb: 0, isSendFtp: 0 })
                    .populate('deviceId', 'deviceName')
                    .sort({ deviceId: 1 })
                    .skip(skip)
                    .limit(limit),
                TagnameModel.countDocuments({})
            ]);

            const result = {
                data,
                page,
                limit,
                total
            }

            return result
        } catch (error) {
            throw error
        }
    },
    getByDevice: async (deviceId) => {
        try {
            const data = await TagnameModel.find(
                { deviceId: deviceId },
                { __v: 0 },
            ).populate('deviceId', 'deviceName')
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (data) => {
        try {
            // const { name, symbol, functionCode, address, bit, dataType, unit, offset, gain, deviceId, isSaveDb, isSendFtp, note } = data
            if (data.name) {
                const existingTag = await TagnameModel.findOne({ name: data.name, deviceId: data.deviceId });
                if (existingTag) {
                    throw new Error('Tag name already exists');
                }
            }
            await TagnameModel.create(data)

            return null
        } catch (error) {
            throw error
        }
    },
    update: async (tagId, data) => {
        try {
            const existingTag = await TagnameModel.findById(tagId);
            if (!existingTag) {
                throw new Error('Tag name not found');
            }

            await TagnameModel.findByIdAndUpdate(tagId, data)

            return null
        } catch (error) {
            throw error
        }
    },
    delete: async (tagId) => {
        try {
            const existingTag = await TagnameModel.findById(tagId);
            if (!existingTag) {
                throw new Error('Tag name not found');
            }

            await TagnameModel.findByIdAndDelete(tagId)

            return null
        } catch (error) {
            throw error
        }
    }

}

module.exports = tagNameService
