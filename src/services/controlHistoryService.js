const { logger } = require('../config/loggerConfig')
const DeviceHandler = require('../device/deviceHandler')
const ControlHistoryModel = require('../models/controlHistory')
const constant = require('../utils/constant/constant')
const { controlConstant } = require('../utils/constant/controlConstant')
const ConfigControlModel = require('../models/configControl')
const ControlHelper = require('../utils/control/controlHelper')

const deviceHandler = new DeviceHandler()
const controlHelper = new ControlHelper()
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const controlHistoryService = {
    getAll: async (query) => {
        try {
            const { startTime, endTime } = query

            const pipeLine = [
                {
                    $match: {
                        startTime: {
                            $gte: new Date(startTime),
                            $lte: new Date(endTime),
                        },
                    },
                },
                {
                    $addFields: {
                        totalTime: {
                            $cond: [
                                { $and: ['$startTime', '$endTime'] },
                                {
                                    $round: [
                                        {
                                            $divide: [
                                                {
                                                    $subtract: [
                                                        '$endTime',
                                                        '$startTime',
                                                    ],
                                                },
                                                1000 * 60,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                                null,
                            ],
                        },
                    },
                },
                {
                    $project: {
                        __v: 0,
                    },
                },
            ]
            const data = await ControlHistoryModel.aggregate(pipeLine)
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (control) => {
        try {
            let { power, action, type } = control
            // const tags = ['controlledByEMS', 'bessReady']
            const maxPower = power
            const tags = ['controlledByEMS']
            const data = await deviceHandler.getValueByName(tags)
            const value = Object.fromEntries(data.map((x) => [x.name, x.value]))
            let statusBess = ''

            const gensetStatus = await deviceHandler.readSingleData(
                Number(controlConstant.ADDRESS_GENSET_STATUS),
                1,
            )

            if (gensetStatus && gensetStatus === 1) {
                return {
                    status: 'warning',
                    message: 'Genset is Working',
                }
            }

            if (value.controlledByEMS === 2) {
                logger.info('controlledByEMS pass')
                // if (value.bessReady === 2) {
                // logger.info('bessReady pass')

                const now = new Date()
                await ControlHistoryModel.findOneAndUpdate(
                    { endTime: null },
                    { endTime: now },
                    { sort: { createdAt: -1 }, new: true },
                )

                const targetMode = control.action === constant.CONTROL_VALUE_CHARGE ? 1 : 2;
                const controlMode = targetMode === 1 ? 'charge' : 'discharge';
                const addressControlMode = controlConstant.ADDRESS_CHARGE_MODE

                logger.info(`BESS is ${controlMode} ... `)
                statusBess = `${controlMode}`;
                await deviceHandler.writeData(
                    addressControlMode,
                    targetMode, // 1: charge, 2: discharge
                )

                await sleep(500)

                // WRITE POWER CHIA THÊM CHO 0.1 MỚI ĐÚNG
                await deviceHandler.writeData(
                    controlConstant.ADDRESS_DEMAND_POWER,
                    power / 0.1,
                )

                await sleep(500)

                let retryCount = 0
                const maxRetries = 5

                while (retryCount < maxRetries) {
                    const writeStatus = await deviceHandler.readSingleData(
                        Number(addressControlMode),
                        targetMode,
                    )

                    if (writeStatus == targetMode) {
                        logger.info(`Write thành công chế độ ${control.action} = ${targetMode}`)
                        break
                    }

                    await deviceHandler.writeData(
                        addressControlMode,
                        targetMode,
                    )

                    await sleep(1000)
                    retryCount++
                }

                if (retryCount === maxRetries) {
                    const errorMsg = `[BESS ERROR] Không thể set mode CHARGING sau ${maxRetries} lần thử. Kiểm tra kết nối!`;
                    logger.error(errorMsg);
                }

                if (type == 'auto') {
                    controlHelper.clearZeroExport()
                    logger.info(
                        `[${controlMode}] Bắt đầu chạy Interval CheckPower ZERO IMPORT`,
                    )

                    controlHelper.zeroExportState = {
                        running: true,
                        power,
                        maxPower,
                        isWrited: false,
                        typeAction: `${controlMode}`
                    }

                    await controlHelper.scheduleZeroExportImport()
                }

                // //WRITE SẠC
                // if (control.action === constant.CONTROL_VALUE_CHARGE) {
                //     logger.info('BESS is Charging ... ')
                //     statusBess = 'Charging'
                //     await deviceHandler.writeData(
                //         controlConstant.ADDRESS_CHARGE_MODE,
                //         1,
                //     )

                //     await sleep(500)

                //     // WRITE POWER CHIA THÊM CHO 0.1 MỚI ĐÚNG
                //     await deviceHandler.writeData(
                //         controlConstant.ADDRESS_DEMAND_POWER,
                //         power / 0.1,
                //     )

                //     await sleep(500)

                //     let retryCount = 0
                //     const maxRetries = 5

                //     while (retryCount < maxRetries) {
                //         //Check xem đã Write được Charging Chưa. Status Charging = 1
                //         const writeStatus = await deviceHandler.readSingleData(
                //             Number(controlConstant.ADDRESS_CHARGE_MODE),
                //             1,
                //         )

                //         if (writeStatus == 1) {
                //             logger.info(`Write thành công chế độ CHARGING ${Number(controlConstant.ADDRESS_CHARGE_MODE)} = 1`)
                //             break
                //         }

                //         await deviceHandler.writeData(
                //             controlConstant.ADDRESS_CHARGE_MODE,
                //             1,
                //         )

                //         await sleep(1000)
                //         retryCount++
                //     }

                //     if (retryCount === maxRetries) {
                //         const errorMsg = `[BESS ERROR] Không thể set mode CHARGING sau ${maxRetries} lần thử. Kiểm tra kết nối!`;
                //         logger.error(errorMsg);
                //     }


                //     if (type == 'auto') {
                //         controlHelper.clearZeroExport()
                //         logger.info(
                //             '[CHARGE] Bắt đầu chạy Interval CheckPower ZERO IMPORT',
                //         )

                //         controlHelper.zeroExportState = {
                //             running: true,
                //             power,
                //             maxPower,
                //             isWrited: false,
                //             typeAction: "charge"
                //         }

                //         await controlHelper.scheduleZeroExportImport()
                //     }
                // }
                // //WRITE XẢ
                // else if (control.action === constant.CONTROL_VALUE_DIS_CHARGE) {
                //     logger.info('BESS is Discharging ... ')
                //     statusBess = 'Discharging'
                //     await deviceHandler.writeData(
                //         controlConstant.ADDRESS_CHARGE_MODE,
                //         2,
                //     )

                //     await sleep(500)

                //     await deviceHandler.writeData(
                //         controlConstant.ADDRESS_DEMAND_POWER,
                //         power / 0.1,
                //     )

                //     await sleep(500)

                //     let retryCount = 0
                //     const maxRetries = 5

                //     while (retryCount < maxRetries) {
                //         //Check xem đã Write được Discharging Chưa. Status Discharging = 2
                //         const writeStatus = await deviceHandler.readSingleData(
                //             Number(controlConstant.ADDRESS_CHARGE_MODE),
                //             1,
                //         )

                //         if (writeStatus == 2) {
                //             logger.info(`Write thành công chế độ DISCHARGING ${Number(controlConstant.ADDRESS_CHARGE_MODE)} = 2`)
                //             break
                //         }

                //         await deviceHandler.writeData(
                //             controlConstant.ADDRESS_CHARGE_MODE,
                //             2,
                //         )

                //         await sleep(1000)
                //         retryCount++
                //     }

                //     if (retryCount === maxRetries) {
                //         const errorMsg = `[BESS ERROR] Không thể set mode DISCHARGE sau ${maxRetries} lần thử. Kiểm tra kết nối!`;
                //         logger.error(errorMsg);
                //     }

                //     if (type == 'auto') {
                //         controlHelper.clearZeroExport()
                //         logger.info(
                //             '[DISCHARGE] Bắt đầu chạy Interval CheckPower ZERO EXPORT',
                //         )

                //         controlHelper.zeroExportState = {
                //             running: true,
                //             power,
                //             maxPower,
                //             isWrited: false,
                //             typeAction: "discharge"
                //         }

                //         await controlHelper.scheduleZeroExportImport()
                //     }
                // }
                // //Lưu history vào DB
                // await ControlHistoryModel.create({
                //     startTime: now,
                //     power,
                //     action,
                // })

                return { status: true, message: `BESS is ${statusBess}` }
            } else {
                logger.error('ControlledByEMS is NOT ready')
                return {
                    status: false,
                    message: 'ControlledByEMS is NOT ready',
                }
            }
        } catch (error) {
            throw error
        }
    },
    update: async () => {
        try {
            const endTime = new Date()
            await ControlHistoryModel.findOneAndUpdate(
                { endTime: null },
                { endTime },
            )

            //Clear Zero Export
            controlHelper.clearZeroExport()

            deviceHandler.writeData(controlConstant.ADDRESS_CHARGE_MODE, 0)
            deviceHandler.writeData(controlConstant.ADDRESS_DEMAND_POWER, 0)
            logger.info('Kết thúc control ...')

            return null
        } catch (error) {
            throw error
        }
    },
}

module.exports = controlHistoryService
