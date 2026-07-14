const { logger } = require('../config/loggerConfig')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
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
                    const tags = tagOverview;

                    let tagnames = await TagnameModel.find({
                        name: { $in: tags },
                    })
                        .select({
                            name: 1,
                            symbol: 1,
                            unit: 1,
                            deviceId: 1,
                        })
                        .lean();

                    // 1. Tạo mảng dữ liệu có kèm values
                    const tagnameValues = tagnames.map((tag) => ({
                        ...tag,
                        values: tagValues[tag._id?.toString()] ?? null,
                    }));

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
    })
}
module.exports = connectSocket
