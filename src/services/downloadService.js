const moment = require('moment-timezone')
const TagnameModel = require('../models/tagname')
const { tagGrid } = require('../utils/constant/tagDashboard')
const { tagTableChart } = require('../utils/constant/tagTableChart')
const ValueModel = require('../models/value')

const downloadService = {
    downloadGenerateTable: async (query) => {
        const { startTime, endTime } = query
        const tagnames = tagTableChart
        const tagInfo = await TagnameModel.find({ name: { $in: tagnames } })
            .select('_id symbol name')
            .lean()
        const tagIds = tagInfo.map((t) => t._id.toString())

        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment.tz(endTime, 'Asia/Ho_Chi_Minh').endOf('day').toDate()

        const pineLine = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    tagValuesArray: { $objectToArray: '$values' },
                },
            },
            { $unwind: '$tagValuesArray' },
            {
                $match: {
                    'tagValuesArray.k': { $in: tagIds },
                },
            },
            { $addFields: { tagId: { $toObjectId: '$tagValuesArray.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },

            // 7. Group lại theo thời gian để tạo các cột báo cáo
            {
                $group: {
                    _id: {
                        time: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:%M:%S',
                                date: '$createdAt',
                                timezone: 'Asia/Ho_Chi_Minh',
                            },
                        },
                    },
                    data: {
                        $push: {
                            k: '$tagInfo.name',
                            v: '$tagValuesArray.v',
                        },
                    },
                },
            },
            {
                $sort: { '_id.time': -1 }, // 1 -> tăng dần , -1 -> giảm dần
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { time: '$_id.time' },
                            { $arrayToObject: '$data' },
                        ],
                    },
                },
            },
        ]

        const tagnameInfo = await ValueModel.aggregate(pineLine)

        // Nội dung file
        const headers = tagInfo.map((tag) => tag.symbol)
        const csvHeader = ['DateTime', ...headers].join(';')
        const csvRows = tagnameInfo.map((row) => {
            const time = row.time
            const values = tagInfo.map((tag) => {
                return row[tag.name] != null ? row[tag.name] : '0'
            })

            return [time, ...values].join(';')
        })
        // const csvContent = `${csvHeader}\n${csvRows}`
        const csvContent = [csvHeader, ...csvRows].join('\n')
        const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8')
        return buffer
    },

    downloadMeterIndex: async (query) => {
        const { startTime, endTime } = query
        const tagnames = tagGrid
        const tagInfo = await TagnameModel.find({ name: { $in: tagnames } })
            .select('_id symbol name')
            .lean()
        const tagIds = tagInfo.map((t) => t._id.toString())

        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment.tz(endTime, 'Asia/Ho_Chi_Minh').endOf('day').toDate()

        const pineLine = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    tagValuesArray: { $objectToArray: '$values' },
                },
            },
            { $unwind: '$tagValuesArray' },
            {
                $match: {
                    'tagValuesArray.k': { $in: tagIds },
                },
            },
            { $addFields: { tagId: { $toObjectId: '$tagValuesArray.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },

            // 7. Group lại theo thời gian để tạo các cột báo cáo
            {
                $group: {
                    _id: {
                        time: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:%M:%S',
                                date: '$createdAt',
                                timezone: 'Asia/Ho_Chi_Minh',
                            },
                        },
                    },
                    data: {
                        $push: {
                            k: '$tagInfo.name',
                            v: '$tagValuesArray.v',
                        },
                    },
                },
            },
            {
                $sort: { '_id.time': -1 }, // 1 -> tăng dần , -1 -> giảm dần
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { time: '$_id.time' },
                            { $arrayToObject: '$data' },
                        ],
                    },
                },
            },
        ]

        const tagnameInfo = await ValueModel.aggregate(pineLine)

        // Nội dung file
        const headers = tagInfo.map((tag) => tag.symbol)
        const csvHeader = ['DateTime', ...headers].join(';')
        const csvRows = tagnameInfo.map((row) => {
            const time = row.time
            const values = tagInfo.map((tag) => {
                return row[tag.name] != null ? row[tag.name] : '0'
            })

            return [time, ...values].join(';')
        })
        // const csvContent = `${csvHeader}\n${csvRows}`
        const csvContent = [csvHeader, ...csvRows].join('\n')
        const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8')
        return buffer
    },
}

module.exports = downloadService
