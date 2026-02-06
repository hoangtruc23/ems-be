const ControlHistoryModel = require('../models/controlHistory')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')
const moment = require('moment-timezone')
const { tagTableChart } = require('../utils/constant/tagTableChart')

const reportService = {
    getChartDashboard: async (query) => {
        const { dateTime } = query
        if (!dateTime) throw new Error('dateTime is required')

        const start = moment
            .tz(dateTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment(start).add(1, 'day').toDate()

        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsArray: { $objectToArray: '$values' } } },
            { $unwind: '$tagsArray' },
            { $addFields: { tagId: { $toObjectId: '$tagsArray.k' } } },
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
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsArray.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    metrics: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    minute: '$_id',
                    bessCharging: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: [
                                                '$$item.k',
                                                [
                                                    'pcs1ChargePower',
                                                    'pcs2ChargePower',
                                                ],
                                            ],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                    bessDischarging: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: [
                                                '$$item.k',
                                                [
                                                    'pcs1DischargePower',
                                                    'pcs2DischargePower',
                                                ],
                                            ],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                    gridImport: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: ['$$item.k', ['importPower']],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                },
            },
        ]

        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    bessCharging: null,
                    bessDischarging: null,
                    gridImport: null,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => [
                    moment(item.minute).valueOf(),
                    {
                        bessCharging: item.bessCharging,
                        bessDischarging: item.bessDischarging,
                        gridImport: item.gridImport,
                    },
                ]),
            )

            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, values)
                }
            }

            // Chuyển map thành mảng định dạng cuối
            const finalData = {
                bessCharging: [],
                bessDischarging: [],
                gridImport: [],
            }

            allMinutes.forEach((values, timestamp) => {
                finalData.bessCharging.push({
                    x: timestamp,
                    y: values.bessCharging,
                })
                finalData.bessDischarging.push({
                    x: timestamp,
                    y: values.bessDischarging,
                })
                finalData.gridImport.push({
                    x: timestamp,
                    y: values.gridImport,
                })
            })

            return [
                { name: 'BESS charging', data: finalData.bessCharging },
                { name: 'BESS discharging', data: finalData.bessDischarging },
                { name: 'Grid import', data: finalData.gridImport },
            ]
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    chartMonitoring: async (query) => {
        const { dateTime } = query

        const start = moment
            .tz(dateTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment(start).add(1, 'day').toDate()
        const tagnames = [
            'pcs1BmsSoc',
            'pcs1ChargePower',
            'pcs1DischargePower',
            'pcs2BmsSoc',
            'pcs2ChargePower',
            'pcs2DischargePower',
        ]
        const tags = await TagnameModel.find({ name: { $in: tagnames } })
            .select({ _id: 1, symbol: 1, name: 1 })
            .lean()
        const idsStr = tags.map((item) => item._id.toString())
        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsValue: { $objectToArray: '$values' } } },
            {
                $addFields: {
                    tagsValue: {
                        $filter: {
                            input: '$tagsValue',
                            as: 'tag',
                            cond: { $in: ['$$tag.k', idsStr] },
                        },
                    },
                },
            },
            {
                $project: {
                    minute: 1,
                    tagsValue: 1,
                },
            },
            { $unwind: '$tagsValue' },
            { $addFields: { tagId: { $toObjectId: '$tagsValue.k' } } },
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
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsValue.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    data: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            { $addFields: { dataObj: { $arrayToObject: '$data' } } },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ minute: '$_id' }, '$dataObj'],
                    },
                },
            },
        ]
        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const defaultValues = tagnames.reduce((acc, tagname) => {
                acc[tagname] = null
                return acc
            }, {})

            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    ...defaultValues,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => {
                    const result = {}
                    tagnames.forEach((tagname) => {
                        result[tagname] = item[tagname]
                    })
                    return [moment(item.minute).valueOf(), result]
                }),
            )
            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, {
                        ...allMinutes.get(timestamp),
                        ...values,
                    })
                }
            }

            const finalData = tagnames.reduce((acc, tagname) => {
                acc[tagname] = []
                return acc
            }, {})

            allMinutes.forEach((values, timestamp) => {
                tagnames.forEach((tagname) => {
                    finalData[tagname].push({
                        x: timestamp,
                        y: values[tagname],
                    })
                })
            })
            const result = tags.map((tag) => ({
                name: tag.symbol,
                data: finalData[tag.name],
            }))

            return result
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    getDataControlChart: async (query) => {
        try {
            const { startTime, endTime, timePeriod } = query

            if (!startTime || !endTime) {
                throw new BadReq(errorCode.ENTER_STARTTIME_ENDTIME)
            }

            const start = moment
                .tz(startTime, 'Asia/Ho_Chi_Minh')
                .startOf('day')
                .toDate()

            const end = moment
                .tz(endTime, 'Asia/Ho_Chi_Minh')
                .endOf('day')
                .toDate()

            if (isNaN(start) || isNaN(end)) {
                throw new Error('Invalid date input')
            }

            let timePeriodExpr
            switch ((timePeriod || 'daily').toLowerCase()) {
                case 'weekly':
                    timePeriodExpr = {
                        $dateToString: {
                            format: '%G-W%V',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
                case 'monthly':
                    timePeriodExpr = {
                        $dateToString: {
                            format: '%m-%Y',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
                case 'daily':
                    timePeriodExpr = {
                        $dateToString: {
                            // format: '%d-%m-%Y',
                            format: '%Y-%m-%d',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
            }

            const pipeLine = [
                {
                    $match: {
                        startTime: {
                            $gte: start,
                            $lte: end,
                        },
                        action: { $in: ['charge', 'discharge'] },
                    },
                },
                {
                    $addFields: {
                        timePeriod: timePeriodExpr,
                    },
                },
                {
                    $sort: { startTime: 1 }, //tăng dần (cũ nhất -> mới nhất)
                },
                {
                    $group: {
                        _id: {
                            action: '$action',
                            timePeriod: '$timePeriod',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $group: {
                        _id: '$_id.action',
                        data: {
                            $push: {
                                x: '$_id.timePeriod',
                                y: '$count',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        data: {
                            $sortArray: {
                                input: '$data', // Sắp xếp mảng data
                                sortBy: { x: 1 }, // Sắp xếp thời gian
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        action: '$_id',
                        data: 1,
                    },
                },
            ]

            const data = await ControlHistoryModel.aggregate(pipeLine)

            return data
        } catch (error) {
            throw error
        }
    },

    controlTable: async (query) => {
        const { startTime, endTime } = query
        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()
        const end = moment.tz(endTime, 'Asia/Ho_Chi_Minh').endOf('day').toDate()

        const pineLine = [
            { $match: { startTime: { $gte: start, $lt: end } } },
            {
                $project: {
                    __v: 0,
                },
            },
        ]
        const tagnameInfo = await ControlHistoryModel.aggregate(pineLine)
        return tagnameInfo
    },

    generateChart: async (query) => {
        const { dateTime, startTime, endTime } = query

        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment
            .tz(endTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        // const end = moment(start).add(1, 'day').toDate()
        const tagnames = tagTableChart
        const tags = await TagnameModel.find({ name: { $in: tagnames } })
            .select({ _id: 1, symbol: 1, name: 1 })
            .lean()
        const idsStr = tags.map((item) => item._id.toString())
        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsValue: { $objectToArray: '$values' } } },
            {
                $addFields: {
                    tagsValue: {
                        $filter: {
                            input: '$tagsValue',
                            as: 'tag',
                            cond: { $in: ['$$tag.k', idsStr] },
                        },
                    },
                },
            },
            {
                $project: {
                    minute: 1,
                    tagsValue: 1,
                },
            },
            { $unwind: '$tagsValue' },
            { $addFields: { tagId: { $toObjectId: '$tagsValue.k' } } },
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
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsValue.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    data: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            { $addFields: { dataObj: { $arrayToObject: '$data' } } },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ minute: '$_id' }, '$dataObj'],
                    },
                },
            },
        ]
        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const defaultValues = tagnames.reduce((acc, tagname) => {
                acc[tagname] = null
                return acc
            }, {})

            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    ...defaultValues,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => {
                    const result = {}
                    tagnames.forEach((tagname) => {
                        result[tagname] = item[tagname]
                    })
                    return [moment(item.minute).valueOf(), result]
                }),
            )
            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, {
                        ...allMinutes.get(timestamp),
                        ...values,
                    })
                }
            }

            const finalData = tagnames.reduce((acc, tagname) => {
                acc[tagname] = []
                return acc
            }, {})

            allMinutes.forEach((values, timestamp) => {
                tagnames.forEach((tagname) => {
                    finalData[tagname].push({
                        x: timestamp,
                        y: values[tagname],
                    })
                })
            })
            const result = tags.map((tag) => ({
                name: tag.symbol,
                data: finalData[tag.name],
            }))

            return result
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    generateTableReport: async (query) => {
        const { startTime, endTime } = query
        const tagnames = tagTableChart
        const tagInfo = await TagnameModel.find({ name: { $in: tagnames } })
            .select('_id')
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
        return tagnameInfo
    },

    getChartVoltage: async () => {
        // const TAG_NAME = 'gridVolt'
        const TAG_NAME = ['gridVolt', 'gridFreq', 'gridPowerFactor']
        const dateTime = new Date()
        const start = moment
            .tz(dateTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment(start).add(1, 'day').toDate()

        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            //Tách createdAt thành minute và chuyển values thành mảng key-value
            {
                $project: {
                    // Lấy timestamp (milliseconds) cho trục X
                    timestamp: { $toLong: '$createdAt' },
                    tagsArray: { $objectToArray: '$values' },
                },
            },
            { $unwind: '$tagsArray' },
            { $addFields: { tagId: { $toObjectId: '$tagsArray.k' } } }, //Chuyển key từ string sang ObjectId để lookup
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
                $match: {
                    // 'tagInfo.name': TAG_NAME,
                    'tagInfo.name': { $in: TAG_NAME },
                },
            },
            {
                $project: {
                    _id: 0,
                    x: '$timestamp',
                    y: '$tagsArray.v', // Lấy giá trị từ mảng key-value
                    name: '$tagInfo.symbol',
                },
            },
            {
                $group: {
                    _id: '$name',
                    data: {
                        $push: {
                            x: '$x',
                            y: '$y',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    data: '$data',
                },
            },
        ]

        const aggregationResult = await ValueModel.aggregate(pipeline)
        return aggregationResult
    },
}

module.exports = reportService
