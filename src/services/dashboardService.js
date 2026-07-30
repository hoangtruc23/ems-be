const mongoose = require('mongoose')
const DeviceModel = require('../models/device')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')

function resolveBucketByDuration(startTs, endTs) {
    if (!startTs || !endTs || endTs <= startTs) {
        return { bucket: 'raw', bucketMs: null }
    }
    const durationMs = endTs - startTs
    const bucketMs = Math.floor(durationMs / 3)
    return { bucket: '4_buckets', bucketMs }
}

function buildSeriesFromAggregates({ devices, rawItems, timestamps }) {
    const dataMap = new Map()
    rawItems.forEach((item) => {
        const key = `${item.deviceId}_${item.ts}`
        dataMap.set(key, item.value)
    })

    const series = devices.map((device) => {
        const devIdStr = device._id.toString()
        const data = timestamps.map((ts) => {
            const key = `${devIdStr}_${ts}`
            return dataMap.has(key) ? dataMap.get(key) : null
        })

        return {
            deviceId: devIdStr,
            name: device.deviceName || devIdStr,
            data: data,
        }
    })

    return { timestamps, series }
}

const dashboardService = {
    getAggregatedLoadChartData: async (query = {}) => {
        const { deviceIds = [], startTime, endTime } = query

        if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
            return { timestamps: [], series: [] }
        }

        const objectIds = deviceIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id))

        if (objectIds.length === 0) {
            return { timestamps: [], series: [] }
        }

        const startTs = startTime ? new Date(startTime).getTime() : new Date().setHours(0, 0, 0, 0)
        const endTs = endTime ? new Date(endTime).getTime() : new Date().setHours(23, 59, 59, 999)

        if (isNaN(startTs) || isNaN(endTs) || endTs <= startTs) {
            return { timestamps: [], series: [] }
        }

        const { bucket, bucketMs } = resolveBucketByDuration(startTs, endTs)
        const timestamps = [0, 1, 2, 3].map((i) => Math.round(startTs + i * bucketMs))

        const devices = await DeviceModel.find({ _id: { $in: objectIds } })
            .select('_id deviceName')
            .lean()

        if (!devices.length) return { timestamps: [], series: [] }

        const foundTags = await TagnameModel.find({
            deviceId: { $in: objectIds },
            name: { $regex: /load/i },
        }).select('_id deviceId').lean()

        if (!foundTags.length) {
            const emptySeries = devices.map((device) => ({
                deviceId: device._id.toString(),
                name: device.deviceName || device._id.toString(),
                data: [null, null, null, null],
            }))
            return { timestamps, series: emptySeries }
        }

        // Đảm bảo ép kiểu ObjectId nhất quán cho $in query
        const tagIdArray = foundTags.map((t) => new mongoose.Types.ObjectId(t._id))

        const startDate = new Date(startTs)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(endTs)
        endDate.setHours(23, 59, 59, 999)

        const pipeline = [
            {
                $match: {
                    deviceId: { $in: objectIds },
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $addFields: {
                    values: {
                        $filter: {
                            input: '$values',
                            as: 'v',
                            cond: {
                                $and: [
                                    { $gte: ['$$v.ts', startTs] },
                                    { $lte: ['$$v.ts', endTs] },
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: '$values' },
            {
                $addFields: {
                    'values.value': {
                        $filter: {
                            input: '$values.value',
                            as: 'inner',
                            cond: { $in: ['$$inner.tagId', tagIdArray] },
                        },
                    },
                },
            },
            { $unwind: '$values.value' },
            {
                $project: {
                    deviceId: '$deviceId',
                    ts: '$values.ts',
                    value: '$values.value.value',
                },
            },
        ]

        const rawItems = await ValueModel.aggregate(pipeline)

        if (!rawItems || rawItems.length === 0) {
            const emptySeries = devices.map((device) => ({
                deviceId: device._id.toString(),
                name: device.deviceName || device._id.toString(),
                data: [null, null, null, null],
            }))
            return { timestamps, series: emptySeries }
        }

        const bucketedMap = new Map()
        rawItems.forEach((item) => {
            let alignedTs = item.ts
            if (bucket !== 'raw' && bucketMs) {
                let bucketIdx = Math.floor((item.ts - startTs) / bucketMs)
                if (bucketIdx >= 3) bucketIdx = 3
                if (bucketIdx < 0) bucketIdx = 0
                alignedTs = Math.round(startTs + bucketIdx * bucketMs)
            }

            const devIdStr = item.deviceId.toString()
            const key = `${devIdStr}_${alignedTs}`

            if (!bucketedMap.has(key)) {
                bucketedMap.set(key, { deviceId: devIdStr, ts: alignedTs, values: [] })
            }
            bucketedMap.get(key).values.push(item.value)
        })

        const aggregatedItems = Array.from(bucketedMap.values()).map((item) => {
            const validVals = item.values.filter((v) => v !== null && v !== undefined && !isNaN(v))
            let avgVal = null

            if (validVals.length > 0) {
                const sum = validVals.reduce((acc, cur) => acc + Number(cur), 0)
                avgVal = parseFloat((sum / validVals.length).toFixed(2))
            }

            return {
                deviceId: item.deviceId,
                ts: item.ts,
                value: avgVal,
            }
        })

        return buildSeriesFromAggregates({
            devices,
            rawItems: aggregatedItems,
            timestamps,
        })
    },
}

module.exports = dashboardService