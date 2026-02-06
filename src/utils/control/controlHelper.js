const { logger } = require('../../config/loggerConfig')
const DeviceHandler = require('../../device/deviceHandler')
const ConfigControlModel = require('../../models/configControl')
const { controlConstant } = require('../constant/controlConstant')

const deviceHandler = new DeviceHandler()

let zeroExportTimerId = null

function ControlHelper() {
    this.zeroExportState = {}
    this.isRunningZeroExport = false
    this.zeroImportState = {}
    this.isRunningZeroImport = false

    this.clearZeroExport = () => {
        if (zeroExportTimerId) {
            clearTimeout(zeroExportTimerId)
            zeroExportTimerId = null
        }
        this.zeroExportState.running = false
        logger.info('Đã clear Schedule ZERO EXPORT IMPORT')
    }

    // this.scheduleZeroExport = async () => {
    //     try {
    //         // Tham chiếu đến biến state cục bộ
    //         if (!this.zeroExportState.running) return

    //         const configControl = await ConfigControlModel.findOne({
    //             type: 'discharge',
    //         })
    //         if (!configControl) {
    //             logger.warn('Không có thông tin ConfigControl')
    //             return
    //         }

    //         const dentaT = Number(configControl.dentaT) * 1000 || 1000

    //         if (configControl.isEnable) {
    //             // ĐỌC GRID POWER
    //             const oldPower = this.zeroExportState.power

    //             const activePower = await deviceHandler.readSingleData(
    //                 Number(controlConstant.ADDRESS_GRID_POWER),
    //                 2,
    //             )

    //             let { power, maxPower } = this.zeroExportState

    //             if (activePower < configControl.p) {
    //                 power = Number(power) - Number(configControl.dentaP)
    //             } else {
    //                 const powerT = Number(power) + Number(configControl.dentaP)

    //                 if (powerT > maxPower) {
    //                     power = maxPower
    //                 } else {
    //                     power = powerT
    //                 }
    //             }

    //             if (power <= 0) {
    //                 power = 0
    //             }

    //             //Check xem ZeroExport có đang hoạt động không. Power hiện tại bé hơn Power ban đầu truyền xuống.
    //             if (power < maxPower) {
    //                 this.isRunningZeroExport = true
    //             } else {
    //                 this.isRunningZeroExport = false
    //             }

    //             this.zeroExportState.power = power

    //             if (power !== oldPower) {
    //                 // WRITE POWER
    //                 await deviceHandler.writeData(
    //                     controlConstant.ADDRESS_DEMAND_POWER,
    //                     power / 0.1,
    //                 )
    //                 this.isWrited = true
    //             } else {
    //                 if (!this.zeroExportState.isWrited) {
    //                     const powerReal = await deviceHandler.readSingleData(
    //                         Number(controlConstant.ADDRESS_DEMAND_POWER),
    //                         1,
    //                     )
    //                     logger.info("powerReal")
    //                     logger.info(powerReal)
    //                     if (powerReal == 0 || powerReal != power / 0.1) {
    //                         await deviceHandler.writeData(
    //                             controlConstant.ADDRESS_DEMAND_POWER,
    //                             power / 0.1,
    //                         )
    //                         this.zeroExportState.isWrited = true
    //                     } else if (Number(powerReal) != 0) {
    //                         this.zeroExportState.isWrited = true
    //                     }
    //                 }
    //             }
    //         } else {
    //             // Nếu configControl.isEnable = false thì giữ nguyên power hiện tại
    //             await deviceHandler.writeData(
    //                 controlConstant.ADDRESS_DEMAND_POWER,
    //                 this.zeroExportState.power / 0.1,
    //             )
    //         }

    //         zeroExportTimerId = setTimeout(this.scheduleZeroExport, dentaT)
    //     } catch (error) {
    //         logger.error('Lỗi chạy Schedule ZERO EXPORT')
    //         logger.error(error)
    //     }
    // }

    this.scheduleZeroExportImport = async () => {
        try {
            // Tham chiếu đến biến state cục bộ
            if (!this.zeroExportState.running) return

            const configControl = await ConfigControlModel.findOne({
                type: `${this.zeroExportState.typeAction}`,  //discharge - charge 
            })

            if (!configControl) {
                logger.warn('Không có thông tin ConfigControl')
                return
            }

            const dentaT = Number(configControl.dentaT) * 1000 || 1000

            if (configControl.isEnable) {
                const oldPower = this.zeroExportState.power

                let { power, maxPower } = this.zeroExportState

                let activePower = 0

                const GRID_POWER = await deviceHandler.readSingleData(
                    Number(controlConstant.ADDRESS_GRID_POWER),
                    2,
                )

                //LOGIC XẢ -> DISCHARGE 
                if (this.zeroExportState.typeAction == "discharge") {
                    // GIRD IMPORT POWER
                    activePower = GRID_POWER

                    // Kiểm tra activePower (undefined, null, NaN)
                    if (activePower === undefined || activePower === null || isNaN(activePower)) {
                        logger.warn('Không đọc được GRID IMPORT POWER, giữ nguyên công suất hiện tại')
                        activePower = 0
                    }

                    //Khi activePower lưới bé hơn configControl.p (Limit) thì giảm công suất sạc xuống
                    if (activePower < configControl.p) {
                        power = Number(power) - Number(configControl.dentaP)
                    } else {
                        const powerT = Number(power) + Number(configControl.dentaP)

                        if (powerT > maxPower) {
                            power = maxPower
                        } else {
                            power = powerT
                        }
                    }

                    if (power <= 0) {
                        power = 0
                    }

                }
                //LOGIC SẠC
                else {
                    try {
                        const SOLAR_POWER = await deviceHandler.readSingleData(
                            Number(controlConstant.ADDRESS_SOLAR_POWER),
                            2,
                        )

                        activePower = Number(GRID_POWER) + Number(SOLAR_POWER)

                        // Kiểm tra nếu activePower không hợp lệ (undefined, null, NaN)
                        if (activePower === undefined || activePower === null || isNaN(activePower)) {
                            logger.warn('Không đọc được SOLAR POWER')
                            activePower = 0
                        }

                        //Khi tổng activePower lớn hơn configControl.p (Limit) thì giảm công suất sạc xuống
                        if (activePower > configControl.p) {
                            power = Number(power) - Number(configControl.dentaP)
                        } else {
                            const powerT = Number(power) + Number(configControl.dentaP)

                            if (powerT > maxPower) {
                                power = maxPower
                            } else {
                                power = powerT
                            }
                        }

                        if (power <= 0) {
                            power = 0
                        }

                    } catch (error) {
                        logger.error('Lỗi đọc SOLAR POWER')
                        logger.error(error)
                        // Giữ nguyên power hiện tại khi lỗi
                    }
                }

                //Check xem ZeroExport có đang hoạt động không. Power hiện tại bé hơn Power ban đầu truyền xuống.
                if (power < maxPower) {
                    this.isRunningZeroExport = true
                } else {
                    this.isRunningZeroExport = false
                }

                this.zeroExportState.power = power

                if (power !== oldPower) {
                    // WRITE POWER
                    await deviceHandler.writeData(
                        controlConstant.ADDRESS_DEMAND_POWER,
                        power / 0.1,
                    )
                } else {
                    if (!this.zeroExportState.isWrited) {
                        const powerReal = await deviceHandler.readSingleData(
                            Number(controlConstant.ADDRESS_DEMAND_POWER),
                            1,
                        )

                        logger.info("powerReal")
                        logger.info(powerReal)

                        if (Number(powerReal) == power / 0.1) {
                            this.zeroExportState.isWrited = true
                        } else if (powerReal == 0 || powerReal != power / 0.1) {
                            await deviceHandler.writeData(
                                controlConstant.ADDRESS_DEMAND_POWER,
                                power / 0.1,
                            )
                        }
                    }
                }
            } else {
                // Nếu configControl.isEnable = false thì giữ nguyên power hiện tại
                await deviceHandler.writeData(
                    controlConstant.ADDRESS_DEMAND_POWER,
                    this.zeroExportState.power / 0.1,
                )
            }

            zeroExportTimerId = setTimeout(this.scheduleZeroExportImport, dentaT)
        } catch (error) {
            logger.error('Lỗi chạy Schedule ZERO EXPORT')
            logger.error(error)
        }
    }

    ControlHelper.instance = this
    return this
}

module.exports = ControlHelper
