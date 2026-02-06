const { Types } = require('mongoose')
const ValueModel = require('../models/value')

const valueService = {
    getAll: async (query) => {
        try {
            let { tagId = '', startTime, endTime } = query

            if (!startTime || !endTime) {
                throw new BadReq(errorCode.ENTER_STARTTIME_ENDTIME)
            }

            const searchTag = tagId
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean) // loại bỏ chuỗi rỗng

            const pineline = [
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startTime),
                            $lte: new Date(endTime),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        values: { $objectToArray: '$values' },
                        ts: { $toLong: '$createdAt' },
                    },
                },
                { $unwind: '$values' },
                {
                    $match: {
                        'values.k': { $in: searchTag },
                    },
                },
                {
                    $addFields: {
                        tagId: { $toObjectId: '$values.k' }, // convert string sang ObjectId
                    },
                },
                {
                    $lookup: {
                        from: 'tagnames',
                        localField: 'tagId',
                        foreignField: '_id',
                        as: 'tagInfo',
                    },
                },
                { $unwind: '$tagInfo' },
                {
                    $project: {
                        _id: 0,
                        value: '$values.v',
                        name: '$tagInfo.name',
                        ts: 1,
                    },
                },
                {
                    $group: {
                        _id: '$name',
                        data: {
                            $push: {
                                x: '$ts',
                                y: '$value',
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: '$_id',
                        data: 1,
                    },
                },
            ]

            const data = await ValueModel.aggregate(pineline)

            return data
        } catch (error) {
            throw error()
        }
    },
}

module.exports = valueService
