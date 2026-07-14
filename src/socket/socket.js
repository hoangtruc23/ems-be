const { logger } = require('../config/loggerConfig')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
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
} = require('../utils/constant/tagDashboard')
const ControlHelper = require('../utils/control/controlHelper')

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
    let pcsAlarmInterval_2 = {}
    let pcsBatteryGroup = {}
    let controlModeInterval = {}
    let gridInterval = {}
    let gensetInterval = {}
    let statusZeroExportInterval = {}

    socket.on('CLIENT GET DASHBOARD INFO', async () => {
        try {
            if (!dashboardInterval[socket.id]) {
                dashboardInterval[socket.id] = setInterval(async () => {
                    const tagValues = deviceHandler.datas
                    const tags = tagDashboard
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

                    const girdAvgValue =
                        tagnameValues
                            .filter((tag) =>
                                [
                                    'gridPowerPh1',
                                    'gridPowerPh2',
                                    'gridPowerPh3',
                                ].includes(tag.name),
                            )
                            .reduce((acc, cur) => acc + (cur.values ?? 0), 0) /
                        3

                    const bessPower = tagnameValues
                        .filter((tag) =>
                            [
                                'pcs1OutputActivePower',
                                'pcs2OutputActivePower',
                            ].includes(tag.name),
                        )
                        .reduce((acc, cur) => acc + (cur.values ?? 0), 0)

                    let bessImport = ''
                    let bessExport = ''
                    // let bessStatus = ''

                    if (bessPower > 0) {
                        bessImport = 0
                        bessExport = bessPower
                    } else if (bessPower < 0) {
                        bessImport = bessPower
                        bessExport = 0
                    }

                    // if (bessImport > 0 && bessExport == 0) {
                    //     bessStatus = 'Charge'
                    // } else if (bessExport > 0 && bessImport == 0) {
                    //     bessStatus = 'Discharge'
                    // } else if (bessExport == 0 && bessImport == 0) {
                    //     bessStatus = 'Idle'
                    // } else {
                    //     bessStatus = 'Fault'
                    // }

                    tagnameValues.push(
                        {
                            name: 'gridAVG',
                            symbol: 'Grid AVG',
                            unit: 'V',
                            values: girdAvgValue,
                        },
                        {
                            name: 'bessPower',
                            symbol: 'Bess Power',
                            unit: 'V',
                            values: bessPower,
                            bessImport: bessImport,
                            bessExport: bessExport,
                            // bessStatus: bessStatus,
                        },
                    )

                    socket.emit('SERVER SEND DASHBOARD VALUE', tagnameValues)
                }, TIME)
            }
        } catch (error) {
            logger.error(error)
        }
    })

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


            trendInterval[socket.id] = setInterval(async () => {

                if (chosenDevices.length === 0) {
                    socket.emit('SERVER SEND TREND TOTAL VALUE', {
                        totalLiveLoad: null, averageVoltage: null, averageCurrent: null, powerFactor: null, frequency: null
                    });
                    return;
                }

                const tagValues = deviceHandler.datas;
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
                    const value = tagValues[tag.name];

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
            }, TIME);

        } catch (error) {
            logger.error(error);
        }
    });

    socket.on('CLIENT GET TREND LOAD CHART', async (data) => {
        try {
            const { deviceIds = [], timeRange = '15m' } = data || {};

            if (trendLoadInterval[socket.id]) {
                clearInterval(trendLoadInterval[socket.id])
            }

            const calculateTimeRange = (range) => {
                const endTime = new Date(); 
                const endTs = endTime.getTime();
                let startTs = endTs;

                switch (range) {
                    case '15m':
                        startTs = endTs - (15 * 60 * 1000);
                        break;
                    case '1H':
                        startTs = endTs - (1 * 60 * 60 * 1000);
                        break;
                    case '6H':
                        startTs = endTs - (6 * 60 * 60 * 1000); 
                        break;
                    case '24H':
                    default:
                        startTs = endTs - (24 * 60 * 60 * 1000); 
                        break;
                }

                return {
                    startTime: new Date(startTs).toISOString(),
                    endTime: endTime.toISOString()
                };
            };

            trendLoadInterval[socket.id] = setInterval(async () => {
                if (deviceIds.length === 0) {
                    socket.emit('SERVER SEND TREND LOAD CHART', {
                        timestamps: [],
                        series: [],
                    })
                    return
                }

                const { startTime, endTime } = calculateTimeRange(timeRange);
                
                const result = await trendService.getAggregatedLoadChartData({
                    deviceIds,
                    startTime,
                    endTime,
                })
                socket.emit('SERVER SEND TREND LOAD CHART', result)
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

        clearInterval(trendInterval[socket.id])
        delete trendInterval[socket.id]

        clearInterval(trendLoadInterval[socket.id])
        delete trendLoadInterval[socket.id]
    })
}
module.exports = connectSocket
