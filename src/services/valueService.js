const { Types } = require('mongoose')
const ValueModel = require('../models/value')
const TagnameModel = require('../models/tagname')
const constant = require('../utils/constant/constant')
const BadReq = require('../utils/response/requestError')
const errorCode = require('../utils/response/errorCode')
const mongoose = require('mongoose');
const { tagTrendPowerAnalysis, tagMeterSummary } = require('../utils/constant/tagDashboard')
const DeviceModel = require('../models/device')

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
                        date: {
                            $gte: new Date(startTime),
                            $lte: new Date(endTime),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        values: { $objectToArray: '$values' },
                        ts: { $toLong: '$date' },
                    },
                },
                { $unwind: '$values' },
            ]

            const data = await ValueModel.aggregate(pineline)

            return data
        } catch (error) {
            throw error()
        }
    },

    // trendPowerAnalysis: async (query) => {
    //     try {
    //         let { deviceId, startTime, endTime } = query;
    //         // 1. Xử lý thời gian   
    //         const startTs = startTime ? Date.parse(startTime) : new Date().setHours(0, 0, 0, 0);
    //         const endTs = endTime ? Date.parse(endTime) : new Date().setHours(23, 59, 59, 999);

    //         // 2. Xử lý deviceId
    //         let deviceIds = [];
    //         if (deviceId === 'all') {
    //             const devices = await TagnameModel.distinct('deviceId');
    //             if (devices.length === 0) throw new BadReq(errorCode.NO_DEVICE_FOUND);
    //             deviceIds = devices;
    //         } else {
    //             const idArray = deviceId.split(',').map(id => id.trim()).filter(Boolean);
    //             deviceIds = idArray.map(id => new mongoose.Types.ObjectId(id));
    //         }

    //         // 3. Lấy danh sách Tag ID
    //         const tagnames = tagTrendPowerAnalysis;
    //         const foundTags = await TagnameModel.find({
    //             deviceId: { $in: deviceIds },
    //             name: { $in: tagnames }
    //         }).select('_id name unit note');

    //         if (foundTags.length === 0) return { timestamps: [startTs, endTs], sensor: [] };
    //         const tagIdArray = foundTags.map(t => t._id);

    //         // 4. Aggregation
    //         const pipeline = [
    //             {
    //                 $match: {
    //                     deviceId: { $in: deviceIds },
    //                     date: { $gte: new Date(startTs), $lte: new Date(endTs) },
    //                 },
    //             },
    //             { $unwind: '$values' },
    //             {
    //                 $project: {
    //                     deviceId: '$deviceId',
    //                     ts: '$values.ts',
    //                     items: {
    //                         $filter: {
    //                             input: '$values.value',
    //                             as: 'v',
    //                             cond: { $in: ['$$v.tagId', tagIdArray] }
    //                         }
    //                     }
    //                 }
    //             },
    //             { $unwind: '$items' },
    //             {
    //                 $lookup: { from: 'tagnames', localField: 'items.tagId', foreignField: '_id', as: 'tagInfo' }
    //             },
    //             { $unwind: '$tagInfo' },
    //             {
    //                 $project: {
    //                     deviceId: '$deviceId',
    //                     tagId: '$items.tagId',
    //                     // name: '$tagInfo.name',
    //                     // unit: '$tagInfo.unit',
    //                     // note: '$tagInfo.note',
    //                     ts: '$ts',
    //                     value: '$items.value',
    //                 }
    //             }
    //         ];

    //         const rawItems = await ValueModel.aggregate(pipeline);

    //         // 5. Gom nhóm và điền null
    //         const timeSet = new Set([startTs, endTs]);
    //         rawItems.forEach(item => timeSet.add(item.ts));
    //         const sortedTimestamps = Array.from(timeSet).sort((a, b) => a - b);

    //         // Khởi tạo sensorMap
    //         const sensorMap = {};
    //         foundTags.forEach(tag => {
    //             sensorMap[tag.name] = {
    //                 name: tag.name,
    //                 unit: tag.unit,
    //                 note: tag.note,
    //                 data: {}
    //             };
    //         });

    //         // Track latest value của từng device cho từng tag
    //         const deviceLatestValues = {};

    //         rawItems.forEach(item => {
    //             // Fill data cho chart (các tag khác i, u, powerFactor)
    //             if (sensorMap[item.name]) {
    //                 sensorMap[item.name].data[item.ts] = item.value;
    //             }

    //             // Track latest value theo deviceId + tagName
    //             const devKey = item.deviceId.toString();
    //             if (!deviceLatestValues[devKey]) deviceLatestValues[devKey] = {};

    //             const current = deviceLatestValues[devKey][item.name];
    //             if (!current || item.ts > current.ts) {
    //                 deviceLatestValues[devKey][item.name] = { value: item.value, ts: item.ts };
    //             }
    //         });

    //         // Tính i (peak), u (avg), powerFactor (sum) từ latest value của mỗi device
    //         const deviceEntries = Object.values(deviceLatestValues);
    //         let peakA = null;
    //         let avgU_Volts = null;
    //         let valuePowerFactor = null;
    //         let uCount = 0;

    //         deviceEntries.forEach(dev => {
    //             if (dev['i'] !== undefined) {
    //                 if (peakA === null || dev['i'].value > peakA) peakA = dev['i'].value;
    //             }
    //             if (dev['u'] !== undefined) {
    //                 avgU_Volts = (avgU_Volts ?? 0) + dev['u'].value;
    //                 uCount++;
    //             }
    //             if (dev['powerFactor'] !== undefined) {
    //                 valuePowerFactor = (valuePowerFactor ?? 0) + dev['powerFactor'].value;
    //             }
    //         });

    //         if (uCount > 0) avgU_Volts = avgU_Volts / uCount;

    //         // Chuyển đổi sang format trả về
    //         const sensor = Object.values(sensorMap).map(s => {
    //             const values = sortedTimestamps.map(ts => s.data[ts] !== undefined ? s.data[ts] : null);
    //             return {
    //                 name: s.name,
    //                 unit: s.unit,
    //                 note: s.note,
    //                 values: s.name === 'powerFactor' ? valuePowerFactor
    //                     : s.name === 'u' ? avgU_Volts
    //                         : s.name === 'i' ? peakA
    //                             : values
    //             };
    //         });

    //         return {
    //             timestamps: sortedTimestamps,
    //             sensor,
    //         };
    //     } catch (error) {
    //         throw error;
    //     }
    // },

    chartAggregatedLoad: async (query) => {
        try {
            let { startTime, endTime } = query;

            // 1. Lấy ngày hôm nay
            const startTs = startTime ? Date.parse(startTime) : new Date().setHours(0, 0, 0, 0);
            const endTs = endTime ? Date.parse(endTime) : new Date().setHours(23, 59, 59, 999);

            // 2. Xử lý deviceId
            let deviceIds = [];
            // const devices = await TagnameModel.distinct('deviceId');
            const devices = await DeviceModel.distinct('_id');

            if (devices.length === 0) throw new BadReq(errorCode.NO_DEVICE_FOUND);
            deviceIds = deviceIds.concat(devices);

            const devicesInfo = await DeviceModel.find({ _id: { $in: deviceIds } }).select('_id deviceName');

            const deviceNameMap = {};
            devicesInfo.forEach(d => {
                deviceNameMap[d._id.toString()] = d.deviceName;
            });
            // ------------------------------------------------------------------

            const foundTags = await TagnameModel.find({
                deviceId: { $in: deviceIds },
                name: 'load'
            }).select('_id name deviceId');

            if (foundTags.length === 0) return [];
            const tagIdArray = foundTags.map(t => t._id);

            const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
            // 4. Aggregation
            const pipeline = [
                {
                    $match: {
                        deviceId: { $in: deviceIds },
                        date: { $gte: new Date(startTs), $lte: new Date(endTs) },
                    },
                },
                { $unwind: '$values' },
                {
                    $match: {
                        $expr: {
                            $in: [
                                // Trích xuất giờ từ timestamp. 
                                { $hour: { date: { $toDate: '$values.ts' }, timezone: 'Asia/Ho_Chi_Minh' } },
                                hours
                            ]
                        }
                    }
                },
                {
                    $project: {
                        deviceId: '$deviceId',
                        ts: '$values.ts',
                        items: {
                            $filter: {
                                input: '$values.value',
                                as: 'v',
                                cond: { $in: ['$$v.tagId', tagIdArray] }
                            }
                        }
                    }
                },
                { $unwind: '$items' },
                {
                    $lookup: { from: 'tagnames', localField: 'items.tagId', foreignField: '_id', as: 'tagInfo' }
                },
                { $unwind: '$tagInfo' },
                {
                    $group: {
                        _id: {
                            deviceId: '$deviceId',
                            tagName: '$tagInfo.name',
                            hour: { $hour: { date: { $toDate: '$ts' }, timezone: 'Asia/Ho_Chi_Minh' } }
                        },
                        // Lấy giá trị TRUNG BÌNH của khung giờ đó. (Có thể thay bằng $max, $min hoặc $first)
                        value: { $avg: '$items.value' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        deviceId: '$_id.deviceId',
                        tagName: '$_id.tagName',
                        hour: '$_id.hour',
                        value: 1
                    }
                },
                {
                    $sort: { x: 1 }
                }
            ];

            const rawItems = await ValueModel.aggregate(pipeline);

            const dataMap = {};
            rawItems.forEach(item => {
                const key = `${item.deviceId}_${item.tagName}_${item.hour}`;
                dataMap[key] = item.value;
            });

            const seriesMap = {};

            deviceIds.forEach(dId => {
                // Nếu thiết bị có nhiều tag, bạn cần lặp qua danh sách tag tại đây
                // Ví dụ giả định: Mỗi thiết bị chỉ có 1 tag 'p' như logic cũ
                const dName = deviceNameMap[dId.toString()] || dId.toString();
                const seriesName = deviceIds.length > 1 ? dName : 'p'; // Điều chỉnh logic series theo ý bạn

                if (!seriesMap[seriesName]) {
                    seriesMap[seriesName] = {
                        name: seriesName,
                        data: []
                    };
                }

                // Lặp qua khung giờ mong muốn và điền dữ liệu
                hours.forEach(hour => {
                    const key = `${dId}_p_${hour}`; // 'p' là tên tag cố định theo code bạn
                    const value = dataMap.hasOwnProperty(key) ? dataMap[key] : null;
                    seriesMap[seriesName].data.push(value);
                });
            });

            // 6. Chuyển Map thành Array và trả về
            const chartData = Object.values(seriesMap);

            return chartData;

        } catch (error) {
            throw error;
        }
    },

    trendPowerAnalysis: async (query) => {
        try {
            let { deviceId, startTime, endTime } = query;
            const startTs = startTime ? Date.parse(startTime) : new Date().setHours(0, 0, 0, 0);
            const endTs = endTime ? Date.parse(endTime) : new Date().setHours(23, 59, 59, 999);

            // Xử lý Device IDs
            let deviceIds = [];
            if (deviceId === '') {
                return null;
            }
            else if (deviceId === 'all') {
                const devices = await TagnameModel.distinct('deviceId');
                if (devices.length === 0) throw new Error('No device found'); // Thay bằng Error của bạn
                deviceIds = devices;
            } else {
                deviceIds = deviceId.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            }

            // Pipeline xử lý tại Database
            const pipeline = [
                { $match: { deviceId: { $in: deviceIds }, date: { $gte: new Date(startTs), $lte: new Date(endTs) } } },
                { $unwind: '$values' },
                { $unwind: '$values.value' },
                { $match: { 'values.value.tagId': { $in: await TagnameModel.distinct('_id', { name: { $in: tagTrendPowerAnalysis } }) } } },
                {
                    $group: {
                        _id: '$values.value.tagId',
                        ts: { $push: '$values.ts' },
                        values: { $push: '$values.value.value' }
                    }
                },
                {
                    $lookup: {
                        from: 'tagnames', // Tên collection của TagnameModel
                        localField: '_id',
                        foreignField: '_id',
                        as: 'info'
                    }
                },
                { $unwind: '$info' },
                {
                    $lookup: {
                        from: 'devices', // Tên collection của DeviceModel
                        localField: 'info.deviceId',
                        foreignField: '_id',
                        as: 'deviceInfo'
                    }
                },
                { $unwind: { path: '$deviceInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        deviceId: '$info.deviceId',
                        deviceName: '$deviceInfo.deviceName', // Lấy tên device ở đây
                        name: '$info.name',
                        symbol: '$info.symbol',
                        unit: '$info.unit',
                        note: '$info.note',
                        ts: 1,
                        values: 1
                    }
                }
            ];

            const rawItems = await ValueModel.aggregate(pipeline);
            // Tính toán các chỉ số đặc biệt (peak, avg, powerFactor) dựa trên dữ liệu đã nhóm
            // Thay vì duyệt hàng nghìn dòng, giờ chỉ duyệt danh sách đã group
            let peakA = null, avgU_Volts = 0, uCount = 0, valuePowerFactor = 0;

            rawItems.forEach(item => {
                const latestVal = item.values[item.values.length - 1];
                // Lưu ý: Kiểm tra name của tag để tính toán
                if (item.name === 'current' && (peakA === null || latestVal > peakA)) peakA = latestVal;
                if (item.name === 'voltage') { avgU_Volts += latestVal; uCount++; }
                if (item.name === 'powerFactor') valuePowerFactor += latestVal;
            });

            const sensor = [];
            const addedSpecials = new Set();

            // Format kết quả cuối cùng
            rawItems.forEach(item => {
                const isSpecial = ['powerFactor', 'voltage', 'current'].includes(item.name);

                if (isSpecial) {
                    // Chỉ thêm vào nếu chưa từng thêm mục này trước đó
                    if (!addedSpecials.has(item.name)) {
                        sensor.push({
                            name: `${item.name}`,
                            values: item.name === 'powerFactor' ? valuePowerFactor
                                : item.name === 'voltage' ? (uCount > 0 ? avgU_Volts / uCount : null)
                                    : peakA
                        });
                        addedSpecials.add(item.name); // Đánh dấu là đã thêm
                    }
                } else {
                    // Nếu là các tag bình thường, thêm vào như cũ
                    sensor.push({
                        name: `${item.name} (${item.deviceName || '-'})`,
                        values: item.values
                    });
                }
            });
            // Lấy timestamp chung (lấy của item đầu tiên hoặc logic tương tự)
            const timestamps = rawItems.length > 0 ? rawItems[0].ts : [startTs, endTs];

            return { timestamps, sensor };

        } catch (error) {
            throw error;
        }
    },

    meterSummary: async () => {
        try {
            const tagnames = tagMeterSummary;

            // 1. Lấy thông tin tags
            const foundTags = await TagnameModel.find({
                name: { $in: tagnames }
            }).select('name unit note');

            if (foundTags.length === 0) return [];

            const tagIdArray = foundTags.map(t => t._id);

            // 2. Cập nhật Pipeline để lấy thêm deviceId
            const pipeline = [
                {
                    $lookup: {
                        from: 'devices', // Tên collection chứa thông tin thiết bị
                        localField: 'deviceId', // Giả sử _id của ValueModel là deviceId
                        foreignField: '_id', // ID của bảng devices
                        as: 'deviceInfo'
                    }
                },
                { $unwind: '$deviceInfo' },
                { $unwind: '$values' },
                { $unwind: '$values.value' },
                { $match: { 'values.value.tagId': { $in: tagIdArray } } },
                {
                    $group: {
                        _id: '$values.value.tagId', // Group theo tagId
                        deviceId: { $first: '$deviceInfo._id' }, // Lấy deviceId từ document gốc
                        deviceName: { $first: '$deviceInfo.deviceName' },
                        latestValue: { $last: '$values.value.value' },
                        latestTs: { $last: '$values.ts' }
                    }
                }
            ];

            const summaryData = await ValueModel.aggregate(pipeline);

            // 3. Chuyển thành Map
            const summaryMap = new Map();
            summaryData.forEach(item => {
                summaryMap.set(item._id.toString(), item);
            });
            // 4. Merge kết quả
            const result = foundTags.map(tag => {
                const data = summaryMap.get(tag._id.toString());
                return {
                    deviceId: data?.deviceId || null,
                    deviceName: data?.deviceName || null,
                    name: tag.name,
                    value: data && data.latestValue ? data.latestValue : null,
                    ts: data && data.latestTs ? data.latestTs : null
                };
            });

            const groupedResult = result.reduce((acc, item) => {
                if (!item.deviceName) return acc;
                if (!acc[item.deviceName]) {
                    acc[item.deviceName] = {
                        deviceId: item.deviceId,
                        deviceName: item.deviceName
                    };
                }
                if (item.name) {
                    acc[item.deviceName][item.name] = item.value;
                }
                return acc;
            }, {});
            const finalResult = Object.values(groupedResult);
            return finalResult;

        } catch (error) {
            throw error;
        }
    },

    //PGAE ANALYSIS
    chartTotalLoad: async (query) => {
        try {
            let { startTime, endTime } = query;

            // 1. Lấy ngày hôm nay
            const startTs = startTime ? Date.parse(startTime) : new Date().setHours(0, 0, 0, 0);
            const endTs = endTime ? Date.parse(endTime) : new Date().setHours(23, 59, 59, 999);

            // 2. Xử lý deviceId
            let deviceIds = [];
            // const devices = await TagnameModel.distinct('deviceId');
            const devices = await DeviceModel.distinct('_id');

            if (devices.length === 0) throw new BadReq(errorCode.NO_DEVICE_FOUND);
            deviceIds = deviceIds.concat(devices);

            const devicesInfo = await DeviceModel.find({ _id: { $in: deviceIds } }).select('_id deviceName');

            const deviceNameMap = {};
            devicesInfo.forEach(d => {
                deviceNameMap[d._id.toString()] = d.deviceName;
            });
            // ------------------------------------------------------------------

            const foundTags = await TagnameModel.find({
                deviceId: { $in: deviceIds },
                name: 'load'
            }).select('_id name deviceId');

            if (foundTags.length === 0) return [];
            const tagIdArray = foundTags.map(t => t._id);

            const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
            // 4. Aggregation
            const pipeline = [
                {
                    $match: {
                        deviceId: { $in: deviceIds },
                        date: { $gte: new Date(startTs), $lte: new Date(endTs) },
                    },
                },
                { $unwind: '$values' },
                {
                    $match: {
                        $expr: {
                            $in: [
                                // Trích xuất giờ từ timestamp. 
                                { $hour: { date: { $toDate: '$values.ts' }, timezone: 'Asia/Ho_Chi_Minh' } },
                                hours
                            ]
                        }
                    }
                },
                {
                    $project: {
                        deviceId: '$deviceId',
                        ts: '$values.ts',
                        items: {
                            $filter: {
                                input: '$values.value',
                                as: 'v',
                                cond: { $in: ['$$v.tagId', tagIdArray] }
                            }
                        }
                    }
                },
                { $unwind: '$items' },
                {
                    $lookup: { from: 'tagnames', localField: 'items.tagId', foreignField: '_id', as: 'tagInfo' }
                },
                { $unwind: '$tagInfo' },
                {
                    $group: {
                        _id: {
                            deviceId: '$deviceId',
                            tagName: '$tagInfo.name',
                            hour: { $hour: { date: { $toDate: '$ts' }, timezone: 'Asia/Ho_Chi_Minh' } }
                        },
                        // Lấy giá trị TRUNG BÌNH của khung giờ đó. (Có thể thay bằng $max, $min hoặc $first)
                        value: { $avg: '$items.value' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        deviceId: '$_id.deviceId',
                        tagName: '$_id.tagName',
                        hour: '$_id.hour',
                        value: 1
                    }
                },
                {
                    $sort: { x: 1 }
                }
            ];

            const rawItems = await ValueModel.aggregate(pipeline);

            const dataMap = {};
            rawItems.forEach(item => {
                const key = `${item.deviceId}_${item.hour}`;
                dataMap[key] = item.value;
            });

            const seriesMap = {};

            deviceIds.forEach(dId => {
                if (!seriesMap['totalLoad']) {
                    seriesMap['totalLoad'] = {
                        name: 'totalLoad',
                        data: []
                    };
                }
                // Lặp qua khung giờ mong muốn và điền dữ liệu
                hours.forEach(hour => {
                    const key = `${dId}_${hour}`; // 'p' là tên tag cố định theo code bạn
                    const value = dataMap.hasOwnProperty(key) ? dataMap[key] : null;
                    seriesMap['totalLoad'].data.push(value);
                });
            });
            console.log(seriesMap)
            // 6. Chuyển Map thành Array và trả về
            const chartData = Object.values(seriesMap);

            return chartData;

        } catch (error) {
            throw error;
        }
    },
}

module.exports = valueService
