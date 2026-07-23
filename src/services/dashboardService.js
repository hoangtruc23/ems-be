// const mongoose = require('mongoose')
// const DeviceModel = require('../models/device')
// const TagnameModel = require('../models/tagname')
// const ValueModel = require('../models/value')

// function alignTimestamp(ts, bucketMs) {
//     if (!bucketMs || bucketMs <= 0) return ts
//     return Math.floor(ts / bucketMs) * bucketMs
// }

// function resolveBucketByDuration(startTs, endTs) {
//     if (!startTs || !endTs || endTs <= startTs) {
//         return { bucket: 'raw', bucketMs: null }
//     }
    
//     const durationMs = endTs - startTs
//     const bucketMs = Math.floor(durationMs / 4)

//     return { bucket: '4_buckets', bucketMs }
// }

// function buildSeriesFromAggregates({ devices, rawItems, timestamps }) {
//     const dataMap = new Map()
//     rawItems.forEach((item) => {
//         const key = `${item.deviceId}_${item.ts}`
//         dataMap.set(key, item.value)
//     })

//     const series = devices.map((device) => {
//         const devIdStr = device._id.toString()
        
//         const data = timestamps.map((ts) => {
//             const key = `${devIdStr}_${ts}`
//             return dataMap.has(key) ? dataMap.get(key) : null
//         })

//         return {
//             deviceId: devIdStr,
//             name: device.deviceName || devIdStr,
//             data: data,
//         }
//     })

//     return {
//         timestamps,
//         series,
//     }
// }

// const dashboardService = {
//     getAggregatedLoadChartData: async (query = {}) => {
//         const { deviceIds = [], startTime, endTime } = query

//         if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
//             return { timestamps: [], series: [] }
//         }

//         const objectIds = deviceIds
//             .filter((id) => mongoose.Types.ObjectId.isValid(id))
//             .map((id) => new mongoose.Types.ObjectId(id))

//         if (objectIds.length === 0) {
//             return { timestamps: [], series: [] }
//         }

//         const startTs = startTime ? new Date(startTime).getTime() : new Date().setHours(0, 0, 0, 0)
//         const endTs = endTime ? new Date(endTime).getTime() : new Date().setHours(23, 59, 59, 999)
//         const startOfDay = new Date(startTs).setHours(0, 0, 0, 0)
//         const endOfDay = new Date(endTs).setHours(23, 59, 59, 999)

//         if (isNaN(startTs) || isNaN(endTs)) {
//             return { timestamps: [], series: [] }
//         }

//         const { bucket, bucketMs } = resolveBucketByDuration(startTs, endTs)

//         const devices = await DeviceModel.find({ _id: { $in: objectIds } })
//             .select('_id deviceName')
//             .lean()

//         if (!devices.length) {
//             return { timestamps: [], series: [] }
//         }

//         const foundTags = await TagnameModel.find({
//             deviceId: { $in: objectIds },
//             name: { $regex: /load/i },
//         })
//             .select('_id name deviceId')
//             .lean()
//         if (!foundTags.length) {
//             return { timestamps: [], series: [] }
//         }

//         const tagIdArray = foundTags.map((t) => t._id)
        
//         const pipeline = [
//             {
//                 $match: {
//                     deviceId: { $in: objectIds },
//                     date: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
//                 },
//             },
//             {
//                 $addFields: {
//                     values: {
//                         $filter: {
//                             input: '$values',
//                             as: 'v',
//                             cond: {
//                                 $and: [
//                                     { $gte: ['$$v.ts', startTs] },
//                                     { $lte: ['$$v.ts', endTs] }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             },
//             { $unwind: '$values' },
//             {
//                 $addFields: {
//                     'values.value': {
//                         $filter: {
//                             input: '$values.value',
//                             as: 'inner',
//                             cond: { $in: ['$$inner.tagId', tagIdArray] }
//                         }
//                     }
//                 }
//             },
//             { $unwind: '$values.value' },
//             {
//                 $project: {
//                     deviceId: '$deviceId',
//                     ts: '$values.ts',
//                     value: '$values.value.value',
//                 },
//             },
//         ]

//         const rawItems = await ValueModel.aggregate(pipeline)
//         if (!rawItems || rawItems.length === 0) {
//             return { timestamps: [], series: [] }
//         }

//         const normalizedItems = rawItems.map((item) => {
//             let alignedTs = item.ts
//             if (bucket !== 'raw' && bucketMs) {
//                 let bucketIdx = Math.floor((item.ts - startTs) / bucketMs)
//                 if (bucketIdx >= 4) bucketIdx = 3
//                 if (bucketIdx < 0) bucketIdx = 0
//                 alignedTs = startTs + bucketIdx * bucketMs
//             }
//             return {
//                 deviceId: item.deviceId.toString(),
//                 ts: alignedTs,
//                 value: item.value,
//             }
//         })

//         const timestampSet = new Set()
//         normalizedItems.forEach((item) => timestampSet.add(item.ts))
//         const timestamps = Array.from(timestampSet).sort((a, b) => a - b)

//         if (bucket !== 'raw') {
//             const bucketedMap = new Map()

//             normalizedItems.forEach((item) => {
//                 const key = `${item.deviceId}_${item.ts}`
//                 if (!bucketedMap.has(key)) {
//                     bucketedMap.set(key, {
//                         deviceId: item.deviceId,
//                         ts: item.ts,
//                         values: [],
//                     })
//                 }
//                 bucketedMap.get(key).values.push(item.value)
//             })

//             const aggregatedItems = Array.from(bucketedMap.values()).map((item) => {
//                 const validVals = item.values.filter((v) => v !== null && v !== undefined)
//                 let avgVal = null

//                 if (validVals.length > 0) {
//                     const sum = validVals.reduce((acc, cur) => acc + Number(cur || 0), 0)
//                     avgVal = parseFloat((sum / validVals.length).toFixed(2))
//                 }

//                 return {
//                     deviceId: item.deviceId,
//                     ts: item.ts,
//                     value: avgVal,
//                 }
//             })

//             return buildSeriesFromAggregates({
//                 devices,
//                 rawItems: aggregatedItems,
//                 timestamps,
//             })
//         }

//         return buildSeriesFromAggregates({
//             devices,
//             rawItems: normalizedItems,
//             timestamps,
//         })
//     },
// }

// module.exports = dashboardService

const mongoose = require('mongoose')
const DeviceModel = require('../models/device')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')

function resolveBucketByDuration(startTs, endTs) {
    if (!startTs || !endTs || endTs <= startTs) {
        return { bucket: 'raw', bucketMs: null }
    }
    const durationMs = endTs - startTs
    // 🟢 SỬA: Chia cho 3 để tạo ra đúng 4 mốc thời gian cố định (0, 1, 2, 3 khớp hoàn toàn socket)
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

    return {
        timestamps,
        series,
    }
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

        if (isNaN(startTs) || isNaN(endTs)) {
            return { timestamps: [], series: [] }
        }

        const { bucket, bucketMs } = resolveBucketByDuration(startTs, endTs)

        // 🟢 CHỦ ĐỘNG TẠO 4 MỐC TIMESTAMPS CỐ ĐỊNH (Tránh bị thiếu hụt, giúp biểu đồ luôn đều đặn)
        const timestamps = [0, 1, 2, 3].map(i => Math.round(startTs + i * bucketMs))

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
        
        // 🟢 SỬA: Lấy chuẩn dải ngày từ startTs đến endTs thay vì ép cứng về đầu/cuối ngày
        const startDate = new Date(startTs);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endTs);
        endDate.setHours(23, 59, 59, 999);

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
                                    { $lte: ['$$v.ts', endTs] }
                                ]
                            }
                        }
                    }
                }
            },
            { $unwind: '$values' },
            {
                $addFields: {
                    'values.value': {
                        $filter: {
                            input: '$values.value',
                            as: 'inner',
                            cond: { $in: ['$$inner.tagId', tagIdArray] }
                        }
                    }
                }
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
        
        // Nếu không có dữ liệu thô, vẫn trả về khung timestamps với dữ liệu bằng null để giữ form biểu đồ
        if (!rawItems || rawItems.length === 0) {
            const emptySeries = devices.map((device) => ({
                deviceId: device._id.toString(),
                name: device.deviceName || device._id.toString(),
                data: [null, null, null, null],
            }))
            return { timestamps, series: emptySeries }
        }

        const normalizedItems = rawItems.map((item) => {
            let alignedTs = item.ts
            if (bucket !== 'raw' && bucketMs) {
                let bucketIdx = Math.floor((item.ts - startTs) / bucketMs)
                if (bucketIdx >= 3) bucketIdx = 3 // Giới hạn tối đa index là 3
                if (bucketIdx < 0) bucketIdx = 0
                alignedTs = startTs + bucketIdx * bucketMs
            }
            return {
                deviceId: item.deviceId.toString(),
                ts: alignedTs,
                value: item.value,
            }
        })

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
    },
}

module.exports = dashboardService