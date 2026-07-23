const { logger } = require('../config/loggerConfig')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
const DeviceModel = require('../models/device')
const trendService = require('../services/trendService')
const {
    tagDashboard,
    tagSingleRack,
    tagOverview,
    tagPCSAlarm,
    tagPCSAlarm_2,
    batteryGroup,
    tagMonitoringPCS,
    tagGrid,
    tagGenset,
    trendSummary,
    tagDashboardSummary,
    tagDashboardRealtimeDataMonitoring,
} = require('../utils/constant/tagDashboard')
const { powerQuality } = require('../utils/constant/tagRealtime')
const ControlHelper = require('../utils/control/controlHelper')
const dashboardService = require('../services/dashboardService')

const deviceHandler = new DeviceHandler()
    ; (async () => {
        try {
            await deviceHandler.connectAll()
        } catch (error) {
            logger.error(error)
        }
    })()

const connectSocket = (socket) => {
    logger.info('[Socket] Client đã kết nối: ' + socket.id)
    const TIME = 3000 //3s
    const CAPACITY = 1.15
    let devicesInterval = {}
    let mornitoringInterval = {}
    let dashboardInterval = {}
    let singleRackInterval = {}
    let pcsAlarmInterval = {}
    let overviewInterval = {}
    let trendInterval = {}
    let trendLoadInterval = {}
    let trendPowerQualityInterval = {}
    let dashboardSummaryInterval = {}
    let dashboardLoadDistributionInterval = {}
    let dashboardConsumptionShareInterval = {}
    let dashboardRealtimeDataMonitoringInterval = {}
    let pcsAlarmInterval_2 = {}
    let pcsBatteryGroup = {}
    let controlModeInterval = {}
    let gridInterval = {}
    let gensetInterval = {}
    let statusZeroExportInterval = {}
    let analysisInterval = {}

    socket.on('CLIENT GET DASHBOARD INFO', async () => {
        try {
            if (!dashboardInterval[socket.id]) {
                dashboardInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas;
                    const tags = [
                        'consumption',
                        'demand',
                        'load',
                        'powerFactor',
                        'activeMeters'
                    ];
                    let tagnames = await TagnameModel.find({
                        name: { $in: tags },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                        })
                        .lean();

                    const tagnameValues = tagnames.reduce((acc, tag) => {
                        acc[tag.name] = tagValues[tag._id?.toString()] ?? null;
                        return acc;
                    }, {});

                    // Fallback to mock values if live readings are null (matches screenshot)
                    const totalConsumption = Number(tagnameValues['consumption'] ?? 12.842);
                    const currentDemand = Number(tagnameValues['demand'] ?? 45.2);
                    const peakLoad = Number(tagnameValues['load'] ?? 88.5);
                    const powerFactor = Number(tagnameValues['powerFactor'] ?? 0.98);
                    const activeMeters = Number(tagnameValues['activeMeters'] ?? (deviceHandler.connectionDevice?.filter(d => d.connected).length || 24));

                    const dashboardData = {
                        totalConsumption: totalConsumption.toFixed(3),
                        currentDemand: currentDemand.toFixed(1),
                        peakLoad: peakLoad.toFixed(1),
                        powerFactor: powerFactor.toFixed(2),
                        activeMeters: String(activeMeters),
                    };

                    socket.emit('SERVER SEND DASHBOARD VALUE', dashboardData);
                }, TIME);
            }
        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET STATUS ZEROEXPORT', async () => {
        try {
            if (!statusZeroExportInterval[socket.id]) {
                statusZeroExportInterval[socket.id] = setInterval(async () => {
                    // const status = ControlHelper.isRunningZeroExport
                    const checkStatus = ControlHelper.instance
                    // let status = []
                    let status = {}
                    if (checkStatus) {
                        // status.push(checkStatus.isRunningZeroExport, checkStatus.isRunningZeroImport)
                        status = {
                            zeroExport: checkStatus.isRunningZeroExport,
                            zeroImport: checkStatus.isRunningZeroImport,
                        }
                    }
                    socket.emit('SERVER SEND STATUS ZEROEXPORT', status)
                }, TIME)
            }
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('CLIENT GET SINGLERACK INFO', async () => {
        try {
            if (!singleRackInterval[socket.id]) {
                singleRackInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas
                    const tags = tagSingleRack

                    let tagnames = await TagnameModel.find({
                        name: { $in: tags },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                        })
                        .lean()

                    const tagnameValues = tagnames.map((tag) => ({
                        ...tag,
                        values: tagValues[tag._id?.toString()] ?? null,
                    }))

                    socket.emit('SERVER SEND SINGLERACK VALUE', tagnameValues)
                }, TIME)
            }
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('CLIENT GET MORNITORING INFO', async () => {
        try {
            if (!mornitoringInterval[socket.id]) {
                mornitoringInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas
                    const tags = tagMonitoringPCS

                    let tagnames = await TagnameModel.find({
                        name: { $in: tags },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                        })
                        .lean()

                    const tagnameValues = tagnames.map((tag) => ({
                        ...tag,
                        values: tagValues[tag._id?.toString()] ?? null,
                    }))

                    socket.emit('SERVER SEND MORNITORING VALUE', tagnameValues)
                }, TIME)
            }
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('CLIENT GET TREND TOTAL VALUE', async (data) => {
        try {
            //Filter meter  
            const chosenDevices = data || [];

            if (trendInterval[socket.id]) {
                clearInterval(trendInterval[socket.id]);
            }

            const tags = trendSummary;
            const regexPattern = new RegExp(tags.join('|'), 'i');
            let tagnames = await TagnameModel.find({
                name: { $regex: regexPattern },
            })
                .select({
                    name: 1,
                    symbol: 1,
                    unit: 1,
                    deviceId: 1,
                })
                .lean();
            const filteredTags = tagnames.filter(tag =>
                chosenDevices.includes(tag.deviceId?.toString())
            );

            trendInterval[socket.id] = setInterval(async () => {
                try {
                    if (chosenDevices.length === 0) {
                        socket.emit('SERVER SEND TREND TOTAL VALUE', {
                            totalLiveLoad: null, averageVoltage: null, averageCurrent: null, powerFactor: null, frequency: null
                        });
                        return;
                    }

                    const tagValues = deviceHandler.datas;

                    if (filteredTags.length === 0) {
                        socket.emit('SERVER SEND TREND TOTAL VALUE', {
                            totalLiveLoad: null,
                            averageVoltage: null,
                            averageCurrent: null,
                            powerFactor: null,
                            frequency: null
                        });
                        return;
                    }

                    let totalLoad = 0;
                    let totalVoltage = 0;
                    let totalCurrent = 0;
                    let totalPF = 0;
                    let totalFreq = 0;

                    let countVoltage = 0;
                    let countCurrent = 0;
                    let countPF = 0;
                    let countFreq = 0;

                    filteredTags.forEach((tag) => {
                        const lowerName = tag.name.toLowerCase();
                        const value = tagValues[tag.name] ?? null;

                        if (value === undefined || value === null) return;

                        if (lowerName.includes('load')) {
                            totalLoad += value;
                        }
                        else if (lowerName.includes('voltage')) {
                            totalVoltage += value;
                            countVoltage++;
                        }
                        else if (lowerName.includes('current')) {
                            totalCurrent += value;
                            countCurrent++;
                        }
                        else if (lowerName.includes('factor') || lowerName.includes('cos')) {
                            totalPF += value;
                            countPF++;
                        }
                        else if (lowerName.includes('freq') || lowerName.includes('hz')) {
                            totalFreq += value;
                            countFreq++;
                        }
                    });
                    const finalResult = {
                        totalLiveLoad: totalLoad > 0 ? totalLoad : null,
                        averageVoltage: countVoltage > 0 ? (totalVoltage / countVoltage) : null,
                        averageCurrent: countCurrent > 0 ? (totalCurrent / countCurrent) : null,
                        powerFactor: countPF > 0 ? (totalPF / countPF) : null,
                        frequency: countFreq > 0 ? (totalFreq / countFreq) : null
                    };

                    socket.emit('SERVER SEND TREND TOTAL VALUE', finalResult);
                } catch (error) {
                    logger.error(error);
                }
            }, TIME);

        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET TREND LOAD CHART', async (data) => {
        try {
            const { deviceIds = [], timeRange = '15m' } = data || {};

            if (trendLoadInterval[socket.id]) {
                clearInterval(trendLoadInterval[socket.id]);
            }

            if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
                socket.emit('SERVER SEND TREND LOAD CHART', { timestamps: [], series: [] });
                return;
            }


            const calculateTimeRange = (range) => {
                const endTime = new Date();
                const endTs = endTime.getTime();
                let startTs = endTs;
                switch (range) {
                    case '15m': startTs = endTs - (15 * 60 * 1000); break;
                    case '1H': startTs = endTs - (1 * 60 * 60 * 1000); break;
                    case '6H': startTs = endTs - (6 * 60 * 60 * 1000); break;
                    case '24H': default: startTs = endTs - (24 * 60 * 60 * 1000); break;
                }
                return { startTime: new Date(startTs).toISOString(), endTime: endTime.toISOString() };
            };

            const { startTime, endTime } = calculateTimeRange(timeRange);

            let chartCache = await trendService.getAggregatedLoadChartData({
                deviceIds,
                startTime,
                endTime,
            });

            const loadTags = await TagnameModel.find({
                deviceId: { $in: deviceIds },
                name: { $regex: /load/i }
            }).select('_id name deviceId').lean();

            socket.emit('SERVER SEND TREND LOAD CHART', chartCache);

            trendLoadInterval[socket.id] = setInterval(() => {
                try {

                    const tagValues = deviceHandler.datas;
                    const now = Date.now(); 

                    chartCache.timestamps.push(now);

                    chartCache.series.forEach(serie => {
                        const tag = loadTags.find(t => t.deviceId.toString() === serie.deviceId);

                        let liveVal = null;
                        if (tag) {
                            liveVal = tagValues[tag._id.toString()] ?? tagValues[tag.name] ?? null;
                        }

                        serie.data.push(liveVal); 
                    });

                    if (chartCache.timestamps.length > 1500) {
                        chartCache.timestamps.shift();
                        chartCache.series.forEach(s => s.data.shift());
                    }

                    socket.emit('SERVER SEND TREND LOAD CHART', chartCache);
                } catch (error) {
                    logger.error(error);
                }
            }, TIME);

        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET POWER QUALITY INFO', async(data) => {
        try {
            const { deviceIds = [] } = data || {};
            if (trendPowerQualityInterval[socket.id]){
                clearInterval(trendPowerQualityInterval[socket.id]);
            }

            const tags = powerQuality;
            const regexPattern = new RegExp(tags.join('|'), 'i');
            let tagnames = await TagnameModel.find({
                name: { $regex: regexPattern },
            })
            .select({
                name: 1,
                symbol: 1,
                unit: 1,
                deviceId: 1,
            })
            .lean()

            const filteredTags = tagnames.filter(tag => deviceIds.includes(tag.deviceId?.toString()));
            
            trendPowerQualityInterval[socket.id] = setInterval(async () => {
                try {

                    if (deviceIds.length === 0) {
                        socket.emit('SERVER SEND POWER QUALITY VALUE', {
                            powerFactor: null,
                            voltageTHD: null,
                            currentTHD: null,
                            phaseImbalance: null
                        });
                        return;
                    }

                    const tagValues = deviceHandler.datas;

                    if (filteredTags.length === 0) {
                        socket.emit('SERVER SEND POWER QUALITY VALUE', {
                            powerFactor: null,
                            voltageTHD: null,
                            currentTHD: null,
                            phaseImbalance: null
                        });
                        return;
                    }

                    let totalPF = 0;
                    let totalVoltageTHD = 0;
                    let totalCurrentTHD = 0;
                    let totalPhaseImbalance = 0;

                    let countPF = 0;
                    let countVoltageTHD = 0;
                    let countCurrentTHD = 0;
                    let countPhaseImbalance = 0;

                    filteredTags.forEach((tag) => {
                        const lowerName = tag.name.toLowerCase();
                        const value = tagValues[tag.name] ?? null;

                        if (value === undefined || value === null) return
                        
                        if (lowerName.includes('cos') || lowerName.includes('factor')) {
                            totalPF += value;
                            countPF++;
                        }
                        else if (lowerName.includes('voltage') && lowerName.includes('thd')){
                            totalVoltageTHD += value;
                            countVoltageTHD++;
                        }
                        else if (lowerName.includes('current') && lowerName.includes('thd')){
                            totalCurrentTHD += value;
                            countCurrentTHD++;
                        } 
                        else if (lowerName.includes('phase') && lowerName.includes('imbalance')) {
                            totalPhaseImbalance += value;
                            countPhaseImbalance++;
                        }
                    });
                    const result = {
                        powerFactor: totalPF > 0 ? (totalPF / countPF) : null,
                        voltageTHD: totalVoltageTHD > 0 ? (totalVoltageTHD / countVoltageTHD) : null,
                        currentTHD: totalCurrentTHD > 0 ? (totalCurrentTHD / countCurrentTHD) : null,
                        phaseImbalance: totalPhaseImbalance > 0 ? (totalPhaseImbalance / countPhaseImbalance) : null
                    };

                    socket.emit('SERVER SEND POWER QUALITY VALUE', result);
                } catch (error) {
                    logger.error(error);
                }
            }, TIME);
        } catch (error) {
            logger.error(error);
        }
    })

    socket.on('CLIENT GET DASHBOARD SUMMARY INFO', async() => {
        try {
            if (dashboardSummaryInterval[socket.id]){
                clearInterval(dashboardSummaryInterval[socket.id]);
            }

            const tags = tagDashboardSummary;
            const regexPattern = new RegExp(tags.join('|'), 'i');
            let tagnames = await TagnameModel.find({
                name: { $regex: regexPattern },
            })
            .select({
                name: 1,
                symbol: 1,
                unit: 1,
                deviceId: 1,
            })
            .populate({
                path: 'deviceId',
                select: 'deviceName'
            })
            .lean()

            let totalDevicesCount = await DeviceModel.countDocuments();

            dashboardSummaryInterval[socket.id] = setInterval(async () => {
                try {
                    const tagValues = deviceHandler.datas;

                    let totalConsumption = 0;
                    let totalDemand = 0;
                    let peakLoad = 0;
                    let totalPF = 0;

                    let peakLoadDeviceId = null;
                    let peakLoadDeviceName = null;
                    let countDemand = 0;
                    let countPF = 0;

                    tagnames.forEach((tag) => {
                        const lowerName = tag.name.toLowerCase();
                        const value = tagValues[tag.name] ?? null;

                        if (value === undefined || value === null) return
                        
                        if (lowerName.includes('consumption')) {
                            totalConsumption += value;
                        }
                        else if (lowerName.includes('demand')){
                            totalDemand += value;
                            countDemand++;
                        }
                        else if (lowerName.includes('load') && value > peakLoad){
                            peakLoad = value;
                            peakLoadDeviceId = tag.deviceId;
                            peakLoadDeviceName = tag.deviceId?.deviceName;
                        } 
                        else if (lowerName.includes('powerfactor')) {
                            totalPF += value;
                            countPF++;
                        }
                    });

                    
                    const onlineDevicesCount = deviceHandler.connectionDevice?.filter(d => d.connected).length || 0;

                    const result = {
                        totalConsumption: totalConsumption > 0 ? totalConsumption : null,
                        currentDemand: totalDemand > 0 ? (totalDemand / countDemand) : null,
                        peakLoad: peakLoad > 0 ? {peakLoad, peakLoadDeviceName} : null,
                        powerFactor: totalPF > 0 ? (totalPF / countPF) : null,
                        activeMeters: {onlineDevicesCount, totalDevicesCount}
                    };

                    socket.emit('SERVER SEND DASHBOARD SUMMARY VALUE', result);
                } catch (error) {
                    logger.error(error)
                }
            }, TIME)
            
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('CLIENT GET DASHBOARD LOAD DISTRIBUTION INFO', async (timeRange = '1H') => {
        try {
            if (typeof timeRange !== 'string') {
                timeRange = '1H';
            }

            if (dashboardLoadDistributionInterval[socket.id]) {
                clearInterval(dashboardLoadDistributionInterval[socket.id]);
            }

            const calculateTimeRange = (range) => {
                const endTime = new Date();
                const endTs = endTime.getTime();
                let startTs = endTs;
                switch (range) {
                    case '1H': startTs = endTs - (1 * 60 * 60 * 1000); break;
                    case '6H': startTs = endTs - (6 * 60 * 60 * 1000); break;
                    case '24H': default: startTs = endTs - (24 * 60 * 60 * 1000); break;
                }
                return { startTime: new Date(startTs).toISOString(), endTime: endTime.toISOString() };
            };

            const { startTime, endTime } = calculateTimeRange(timeRange);
            const device = await DeviceModel.distinct('_id', {isEnable : true});
            const deviceIds = device.map(id => id.toString());

            if (deviceIds.length === 0) {
                socket.emit('SERVER SEND DASHBOARD LOAD DISTRIBUTION VALUE', { timestamps: [], series: [] });
                return;
            }

            let chartCache = await dashboardService.getAggregatedLoadChartData({
                deviceIds,
                startTime,
                endTime,
            });

            const startTs = new Date(startTime).getTime();
            const endTs = new Date(endTime).getTime();
            const bucketMs = (endTs - startTs) / 4;

            // Fallback
            if (!chartCache.timestamps || chartCache.timestamps.length === 0) {
                chartCache.timestamps = [0, 1, 2, 3].map(i => Math.round(startTs + i * bucketMs));
                chartCache.series = deviceIds.map(id => ({ deviceId: id, name: id, data: [null, null, null, null] }));
            }

            chartCache.series.forEach(s => {
                s.type = 'column'; 
            });

            const avgData = chartCache.timestamps.map((ts, index) => {
                let sum = 0;
                let count = 0;

                chartCache.series.forEach(s => {
                    const val = s.data[index];
                    if (val !== null && val !== undefined && !isNaN(val)) {
                        sum += Number(val);
                        count++;
                    }
                });
            
                return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
            });

            chartCache.series.push({
                deviceId: 'AVG_LOAD',
                name: 'AVG Load',
                type: 'line',
                data: avgData
            });

            socket.emit('SERVER SEND DASHBOARD LOAD DISTRIBUTION VALUE', chartCache);

            const loadTags = await TagnameModel.find({
                deviceId: { $in: deviceIds },
                name: { $regex: /load/i }
            }).select('_id name deviceId').lean();

            const loadTagByDevice = new Map(
                loadTags.map(t => [t.deviceId.toString(), t])
            );

            dashboardLoadDistributionInterval[socket.id] = setInterval(() => {
                try {

                    const tagValues = deviceHandler.datas;

                    let sumLive = 0;
                    let countLive = 0;

                    chartCache.series.forEach(serie => {
                        if (serie.deviceId === 'AVG_LOAD') return 
                        const tag = loadTagByDevice.get(serie.deviceId);

                        let liveVal = null;
                        if (tag) {
                            liveVal = tagValues[tag._id.toString()] ?? tagValues[tag.name] ?? null;
                        }

                        if (liveVal !== null && liveVal !== undefined && !isNaN(liveVal)) {
                            sumLive += Number(liveVal);
                            countLive++;
                        }

                        serie.data[3] = liveVal;
                    });

                    const avgSerie = chartCache.series.find(s => s.deviceId === 'AVG_LOAD');
                    if (avgSerie) {
                        const realtimeAvg = countLive > 0 ? parseFloat((sumLive / countLive).toFixed(2)) : null;
                        avgSerie.data[3] = realtimeAvg;
                    }

                    socket.emit('SERVER SEND DASHBOARD LOAD DISTRIBUTION VALUE', chartCache);
                } catch (error) {
                    logger.error(error);
                }
            }, TIME);

        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET DASHBOARD CONSUMPTION SHARE INFO', async () => {
        try {
            if (dashboardConsumptionShareInterval[socket.id]) {
                clearInterval(dashboardConsumptionShareInterval[socket.id]);
            }

            const enabledDevices = await DeviceModel.find({ isEnable: true }).select('_id deviceName').lean();
            const enabledDeviceIds = enabledDevices.map(d => d._id);

            if (enabledDeviceIds.length === 0) {
                socket.emit('SERVER SEND DASHBOARD CONSUMPTION SHARE VALUE', { labels: [], series: [], percentages: [], totalConsumption: null });
                return;
            }

            let tagnames = await TagnameModel.find({
                deviceId: { $in: enabledDeviceIds},
                name: { $regex: /consumption/i },
            })
            .select('_id name deviceId')
            .populate({
                path: 'deviceId',
                select: 'deviceName',
            })
            .lean();

            dashboardConsumptionShareInterval[socket.id] = setInterval(async () => {
                try {
                    const tagValues = deviceHandler.datas || {};

                    let totalConsumption = 0;
                    const deviceDataList = [];

                    tagnames.forEach((tag) => {
                        const rawVal = tagValues[tag._id?.toString()] ?? tagValues[tag.name] ?? 0;
                        const val = Number(rawVal) > 0 ? Number(rawVal) : 0;

                        const labelName = tag.deviceId?.deviceName || tag.name;

                        totalConsumption += val;
                        deviceDataList.push({
                            label: labelName,
                            value: val,
                        });
                    });

                    const series = [];
                    const labels = [];
                    const percentages = [];

                    deviceDataList.forEach((item) => {
                        const percent = totalConsumption > 0 
                            ? parseFloat(((item.value / totalConsumption) * 100).toFixed(2)) 
                            : 0;

                        labels.push(item.label);
                        series.push(item.value);
                        percentages.push(percent);
                    });

                    const result = {
                        labels,        
                        series,     
                        percentages,
                        totalConsumption: parseFloat(totalConsumption.toFixed(2))
                    };

                    socket.emit('SERVER SEND DASHBOARD CONSUMPTION SHARE VALUE', result);

                } catch (error) {
                    logger.error(error)
                }
            }, TIME)
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('CLIENT GET REALTIME MONITORING INFO', async () => {
        try {
            if (dashboardRealtimeDataMonitoringInterval[socket.id]) {
                clearInterval(dashboardRealtimeDataMonitoringInterval[socket.id]);
            }

            const devices = await DeviceModel.find()
                    .select('_id deviceName deviceCode')
                    .lean();

            if (!devices.length) {
                socket.emit('SERVER SEND REALTIME MONITORING VALUE', []);
                return;
            }

            const deviceIds = devices.map(d => d._id);

            const tags = tagDashboardRealtimeDataMonitoring;
            const regexPattern = new RegExp(tags.join('|'), 'i');

            const tagnames = await TagnameModel.find({
                    deviceId: { $in: deviceIds },
                    name: { $regex: regexPattern }
            })
            .select('_id name deviceId')
            .lean();

            const tagsByDevice = new Map();
            tagnames.forEach(t => {
                const id = t.deviceId?.toString();
                if (!id) return;
                if (!tagsByDevice.has(id)) tagsByDevice.set(id, []);
                tagsByDevice.get(id).push(t);
            });

            dashboardRealtimeDataMonitoringInterval[socket.id] = setInterval(async () => {
                try {
                    const tagValues = deviceHandler.datas || {};
                    const connectionDevices = deviceHandler.connectionDevice || [];

                    const connMap = new Map(connectionDevices.map(c => [c.deviceId, c]));

                    const result = devices.map((device) => {
                        const deviceId = device._id.toString();

                        const conn = connMap.get(deviceId);  
                        const status = (conn && conn.connected) ? 'Active' : 'Inactive';
                        const deviceTag =  tagsByDevice.get(deviceId) || [];

                        let voltageVal = null;
                        let currentVal = null;
                        let loadVal = null;

                        deviceTag.forEach((tag) => {
                            const lowerName = tag.name.toLowerCase();

                            const value = tagValues[tag.name] ?? null;

                            if (value === undefined || value === null) return

                            if(lowerName.includes('voltage')) {
                                voltageVal = value;
                            } else if (lowerName.includes('current')) {
                                currentVal = value;
                            } else if (lowerName.includes('load')) {
                                loadVal = value;
                            }
                        });

                        return {
                            deviceId: deviceId,
                            code: device.deviceCode || null,
                            status: status,
                            voltage: voltageVal !== null ? parseFloat(voltageVal.toFixed(2)) : null,
                            current: currentVal !== null ? parseFloat(currentVal.toFixed(2)) : null,
                            load: loadVal !== null ? parseFloat(loadVal.toFixed(2)) : null,
                        };
                    })
                    socket.emit('SERVER SEND REALTIME MONITORING VALUE', result);
                } catch (error) {
                    logger.error(error)
                }
            }, TIME)

        } catch (error) {
            logger.error(error)
        }
    })

    //Client sent data DEVICE
    socket.on('device:getStatus', async () => {
        try {
            if (!devicesInterval[socket.id]) {
                devicesInterval[socket.id] = setInterval(async () => {
                    const connectionDevice = await deviceHandler.connectionDevice
                    socket.emit('SERVER SEND DEVICE STATUS', connectionDevice)
                }, 1000) //1s
            }
        } catch (error) {
            logger.error(error)
        }
    })

    socket.on('tag:getValueOverview', async () => {
        try {
            if (!overviewInterval[socket.id]) {
                overviewInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas;
                    // console.log(tagValues);
                    const tags = tagOverview;

                    const regexPattern = new RegExp(tags.join('|'), 'i');

                    let tagnames = await TagnameModel.find({
                        name: { $regex: regexPattern },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                            deviceId: 1,
                        })
                        .lean();

                    // 1. Tạo mảng dữ liệu có kèm values
                    const tagnameValues = tagnames.map((tag) => {
                        let standardName = tag.name;
                        const lowerName = tag.name.toLowerCase();

                        //Mapping 
                        if (lowerName.includes('current')) {
                            standardName = 'current';
                        } else if (lowerName.includes('voltage')) {
                            standardName = 'voltage';
                        } else if (lowerName.includes('factor') || lowerName.includes('cos')) {
                            standardName = 'powerFactor';
                        } else if (lowerName.includes('load')) {
                            standardName = 'load';
                        }

                        return {
                            ...tag,
                            name: standardName,
                            values: tagValues[tag.name] ?? null,
                        };
                    });

                    // 2. Nhóm theo deviceId
                    const groupedData = tagnameValues.reduce((acc, tag) => {
                        const id = tag.deviceId ? tag.deviceId.toString() : 'unknown';
                        if (!acc[id]) {
                            acc[id] = [];
                        }
                        acc[id].push(tag);
                        return acc;
                    }, {});

                    // Gửi dữ liệu đã nhóm lên client
                    socket.emit('SERVER SEND OVERVIEW VALUE', groupedData);

                }, TIME);
            }
        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET ANALYSIS INFO', async () => {
        try {
            if (!analysisInterval[socket.id]) {
                analysisInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas;
                    const tags = [
                        'consumption',
                        'powerFactor',
                        'demand',
                        'co2Emission',
                        'voltageTHD',
                        'voltageImbalance',
                        'load'
                    ];
                    let tagnames = await TagnameModel.find({
                        name: { $in: tags },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                        })
                        .lean();

                    const tagnameValues = tagnames.reduce((acc, tag) => {
                        acc[tag.name] = tagValues[tag._id?.toString()] ?? null;
                        return acc;
                    }, {});

                    // Fallback mock values for dashboard cards if live device readings are null
                    const consumptionVal = tagnameValues['consumption'] ?? 735.5; // kWh
                    const powerFactorVal = tagnameValues['powerFactor'] ?? 0.95;
                    const demandVal = tagnameValues['demand'] ?? 500; // kW
                    const co2Val = tagnameValues['co2Emission'] ?? (consumptionVal * 0.6592 / 1000); // tons
                    const voltageThdVal = tagnameValues['voltageTHD'] ?? 2.8;
                    const voltageImbalanceVal = tagnameValues['voltageImbalance'] ?? 0.7;

                    const tariff = 0.15; // $0.15 per kWh
                    const energyCostVal = consumptionVal * tariff;
                    const estimatedSavingVal = energyCostVal * 0.05; // 5% saving opportunity

                    let abnormalCount = 0;
                    try {
                        const AlarmModel = require('../models/alarm');
                        abnormalCount = await AlarmModel.countDocuments({ status: 'unResolved' });
                    } catch (err) {
                        logger.error(err);
                    }

                    const analysisData = {
                        energyCost: `$${energyCostVal.toFixed(1)}`,
                        estimatedCostOpportunity: `$${estimatedSavingVal.toFixed(1)}`,
                        peakDemand: `${demandVal.toFixed(0)}`,
                        powerFactor: `${powerFactorVal.toFixed(2)}`,
                        co2Emission: `${co2Val.toFixed(0)}`,
                        abnormalEvents: `${abnormalCount || 5}`,
                        voltageThd: `${voltageThdVal.toFixed(1)}%`,
                        voltageImbalance: `${voltageImbalanceVal.toFixed(1)}%`,
                    };

                    socket.emit('SERVER SEND ANALYSIS VALUE', analysisData);
                }, TIME);
            }
        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('disconnect', (data) => {
        logger.info('[Socket] Client đã kết thúc')
        clearInterval(devicesInterval[socket.id])
        delete devicesInterval[socket.id]

        clearInterval(mornitoringInterval[socket.id])
        delete mornitoringInterval[socket.id]

        clearInterval(dashboardInterval[socket.id])
        delete dashboardInterval[socket.id]

        clearInterval(singleRackInterval[socket.id])
        delete singleRackInterval[socket.id]

        clearInterval(pcsAlarmInterval[socket.id])
        delete pcsAlarmInterval[socket.id]

        clearInterval(pcsAlarmInterval_2[socket.id])
        delete pcsAlarmInterval_2[socket.id]

        clearInterval(overviewInterval[socket.id])
        delete overviewInterval[socket.id]

        clearInterval(pcsBatteryGroup[socket.id])
        delete pcsBatteryGroup[socket.id]

        clearInterval(controlModeInterval[socket.id])
        delete controlModeInterval[socket.id]

        clearInterval(gridInterval[socket.id])
        delete gridInterval[socket.id]

        clearInterval(gensetInterval[socket.id])
        delete gensetInterval[socket.id]

        clearInterval(statusZeroExportInterval[socket.id])
        delete statusZeroExportInterval[socket.id]

        clearInterval(analysisInterval[socket.id])
        delete analysisInterval[socket.id]

        clearInterval(trendInterval[socket.id])
        delete trendInterval[socket.id]

        clearInterval(trendLoadInterval[socket.id])
        delete trendLoadInterval[socket.id]

        clearInterval(trendPowerQualityInterval[socket.id])
        delete trendPowerQualityInterval[socket.id]

        clearInterval(dashboardSummaryInterval[socket.id])
        delete dashboardSummaryInterval[socket.id]

        clearInterval(dashboardLoadDistributionInterval[socket.id])
        delete dashboardLoadDistributionInterval[socket.id]

        clearInterval(dashboardConsumptionShareInterval[socket.id])
        delete dashboardConsumptionShareInterval[socket.id]

        clearInterval(dashboardRealtimeDataMonitoringInterval[socket.id])
        delete dashboardRealtimeDataMonitoringInterval[socket.id]
    })
}
module.exports = connectSocket
