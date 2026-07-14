const mongoose = require('mongoose')
const DeviceModel = require('../models/device')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')

function alignTimestamp(ts, bucketMs) {
    if (!bucketMs || bucketMs <= 0) return ts
    return Math.floor(ts / bucketMs) * bucketMs
}

function resolveBucketByDuration(startTs, endTs) {
    if (!startTs || !endTs || endTs <= startTs) {
        return { bucket: 'raw', bucketMs: null }
    }
    
    const durationMs = endTs - startTs
    const hours = durationMs / (1000 * 60 * 60)

    if (hours <= 0.3) {
        return { bucket: '15s', bucketMs: 15 }      
    } else if (hours <= 1.5) {
        return { bucket: '1m', bucketMs: 60 * 1000 }   
    } else if (hours <= 8) {
        return { bucket: '5m', bucketMs: 5 * 60 * 1000 } 
    } else {
        return { bucket: '20m', bucketMs: 20 * 60 * 1000 } 
    }
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

    return {
        timestamps,
        series,
    }
}

const trendService = {
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
        const startOfDay = new Date(startTs).setHours(0, 0, 0, 0)
        const endOfDay = new Date(endTs).setHours(23, 59, 59, 999)

        if (isNaN(startTs) || isNaN(endTs)) {
            return { timestamps: [], series: [] }
        }

        const { bucket, bucketMs } = resolveBucketByDuration(startTs, endTs)

        const devices = await DeviceModel.find({ _id: { $in: objectIds } })
            .select('_id deviceName')
            .lean()

        if (!devices.length) {
            return { timestamps: [], series: [] }
        }

        const foundTags = await TagnameModel.find({
            deviceId: { $in: objectIds },
            name: { $regex: /load/i },
        })
            .select('_id name deviceId')
            .lean()
        if (!foundTags.length) {
            return { timestamps: [], series: [] }
        }

        const tagIdArray = foundTags.map((t) => t._id)

        const pipeline = [
            {
                $match: {
                    deviceId: { $in: objectIds },
                    date: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
                },
            },
            { $unwind: '$values' },
            {
                $match: {
                    'values.ts': { 
                        $gte: startTs, 
                        $lte: endTs 
                    }
                }
            },
            { $unwind: '$values.value' },
            {
                $match: {
                    'values.value.tagId': { $in: tagIdArray },
                },
            },
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
            return { timestamps: [], series: [] }
        }

        const normalizedItems = rawItems.map((item) => ({
            deviceId: item.deviceId.toString(),
            ts: bucket === 'raw' ? item.ts : alignTimestamp(item.ts, bucketMs),
            value: item.value,
        }))

        const timestampSet = new Set()
        normalizedItems.forEach((item) => timestampSet.add(item.ts))
        const timestamps = Array.from(timestampSet).sort((a, b) => a - b)

        if (bucket !== 'raw') {
            const bucketedMap = new Map()

            normalizedItems.forEach((item) => {
                const key = `${item.deviceId}_${item.ts}`
                if (!bucketedMap.has(key)) {
                    bucketedMap.set(key, {
                        deviceId: item.deviceId,
                        ts: item.ts,
                        values: [],
                    })
                }
                bucketedMap.get(key).values.push(item.value)
            })

            const aggregatedItems = Array.from(bucketedMap.values()).map((item) => {
                const validVals = item.values.filter((v) => v !== null && v !== undefined)
                let avgVal = null

                if (validVals.length > 0) {
                    const sum = validVals.reduce((acc, cur) => acc + Number(cur || 0), 0)
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
        }

        return buildSeriesFromAggregates({
            devices,
            rawItems: normalizedItems,
            timestamps,
        })
    },
}

module.exports = trendService
