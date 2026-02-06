const { CronJob } = require('cron')
const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')
const TagnameModel = require('../models/tagname')
const {
    getDataByteOfAddress,
    getDataByDataType,
} = require('../utils/modbus/modbusHelper')
const ModbusHandler = require('./modbus/modbusClient')
const { addressPCSAlarms } = require('../utils/constant/tagDashboard')
const { controlConstant } = require('../utils/constant/controlConstant')

class ReadTimeoutError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ReadTimeoutError'
    }
}

function DeviceHandler() {
    if (typeof DeviceHandler.instance === 'object') {
        return DeviceHandler.instance
    }
    this.devices = {}
    this.datas = {}
    this.connectionDevice = []
    this.readDataCron = null
    this.reconnectDevice = []
    this.isReading = false

    this.connectAll = async () => {
        try {
            const devices = await DeviceModel.find().select('_id')
            await Promise.all(
                devices.map(async (device) => {
                    this.connect(device._id.toString())
                }),
            )
            this.readData()
        } catch (error) {
            logger.error(`ConnectAll lỗi`)
            logger.error(error)
        }
    }

    this.connect = async (deviceId) => {
        clearTimeout(this.reconnectDevice[deviceId])
        this.reconnectDevice[deviceId] = null

        const device = await DeviceModel.findById(deviceId)
        let deviceStatus = this.connectionDevice.find(
            (d) => d.deviceId === device._id.toString(),
        )
        if (!deviceStatus) {
            deviceStatus = {
                deviceId: device._id.toString(),
                alive: false,
            }
            this.connectionDevice.push(deviceStatus)
        } else {
            deviceStatus.alive = false
        }

        if (device.isEnable) {
            try {
                if (this.devices[deviceId]) {
                    await this.devices[deviceId].close() // Disconnect IP
                    delete this.devices[deviceId]
                }

                this.devices[deviceId] = null
                const modbusHandler = new ModbusHandler(device)
                this.devices[deviceId] = modbusHandler
                await modbusHandler.connectTCP()

                deviceStatus.alive = true
                logger.info(
                    `Thiết bị ${device.deviceName} đã kết nối thành công!`,
                )

                clearTimeout(this.reconnectDevice[deviceId])
                this.reconnectDevice[deviceId] = null
            } catch (error) {
                deviceStatus.alive = false

                logger.error(`Connect ${device.deviceName} lỗi`)
                logger.error(error)

                this.reconnectDevice[deviceId] = setTimeout(() => {
                    this.connect(deviceId)
                }, 5000)
            }
        } else {
            deviceStatus.alive = false
            this.disconnect(deviceId)
        }
    }

    this.disconnect = async (deviceId) => {
        logger.warn(`Thiết bị ${deviceId} tắt kết nối!`)
        try {
            if (this.devices[deviceId]) {
                await this.devices[deviceId].close() // Disconnect IP
                delete this.devices[deviceId]
                logger.info(`Đã ngắt kết nối thiết bị ${deviceId}`)

                clearTimeout(this.reconnectDevice[deviceId])
                this.reconnectDevice[deviceId] = null
            }
        } catch (error) {
            logger.error(`Thiết bị ${deviceId} tắt kết nối lỗi`, error)
        }
    }

    this.readData = async () => {
        try {
            this.readDataCron = new CronJob(`*/5 * * * * *`, async () => {
                if (this.isReading) {
                    // logger.warn('Cron trước chưa đọc xong, bỏ qua lần này.')
                    return
                }
                try {
                    this.isReading = true
                    const tagnames = await TagnameModel.find({ bit: null })

                    for (let tagname of tagnames) {
                        const {
                            _id,
                            functionCode,
                            address,
                            dataType,
                            offset,
                            gain,
                            deviceId,
                        } = tagname

                        const deviceStatus = this.connectionDevice.find(
                            (d) => d.deviceId == deviceId,
                        )
                        if (
                            !this.devices[deviceId] ||
                            !this.devices[deviceId]?.device.isEnable ||
                            !deviceStatus.alive
                        ) {
                            // logger.warn(`Bỏ qua tag vì thiết bị ${deviceId} chưa kết nối.`)
                            this.datas[_id] = null
                            continue
                        }

                        switch (functionCode) {
                            // case 0: {
                            //     try {
                            //         const rawData = await this.devices[
                            //             deviceId
                            //         ].readCoils(address, 1)
                            //         this.datas[_id] = rawData
                            //     } catch (error) {
                            //         this.datas[_id] = null
                            //         logger.error(
                            //             `Đọc và xử lý dữ liệu functionCode 0 lỗi`,
                            //         )
                            //         logger.error(error)
                            //         logger.error(
                            //             `Device ${deviceId} disconnected. Reconnecting...`,
                            //         )
                            //     }
                            //     break
                            // }
                            // case 1: {
                            //     try {
                            //         const rawData = await this.devices[
                            //             deviceId
                            //         ].readDiscreteInputs(address, 1)
                            //         this.datas[_id] = rawData
                            //     } catch (error) {
                            //         this.datas[_id] = null
                            //         logger.error(
                            //             `Đọc và xử lý dữ liệu functionCode 1 lỗi`,
                            //         )
                            //         logger.error(error)
                            //         logger.error(
                            //             `Device ${deviceId} disconnected. Reconnecting...`,
                            //         )
                            //     }
                            //     break
                            // }
                            case 3: {
                                try {
                                    const rawData = await this.devices[
                                        deviceId
                                    ].readHoldingRegisters(
                                        address,
                                        getDataByteOfAddress(dataType),
                                    )
                                    let data = getDataByDataType(
                                        rawData.buffer,
                                        dataType,
                                    )

                                    if (
                                        gain !== undefined &&
                                        offset !== undefined
                                    ) {
                                        data = data * gain + offset
                                    }
                                    this.datas[_id] = data
                                } catch (error) {
                                    this.datas[_id] = null
                                    logger.error(
                                        `Đọc và xử lý dữ liệu functionCode 3 lỗi ${address}`,
                                    )
                                    logger.error(error)
                                    if (
                                        error.message &&
                                        error.message.includes('Port Not Open')
                                    ) {
                                        if (!this.reconnectDevice[deviceId]) {
                                            await this.connect(deviceId)
                                        }
                                    }
                                }
                                break
                            }
                            case 4: {
                                try {
                                    const rawData = await this.devices[
                                        deviceId
                                    ]?.readInputRegisters(
                                        Number(address),
                                        getDataByteOfAddress(dataType),
                                    )

                                    let data = getDataByDataType(
                                        rawData.buffer,
                                        dataType,
                                    )
                                    if (
                                        gain !== undefined &&
                                        offset !== undefined
                                    ) {
                                        data = data * gain + offset
                                    }

                                    if (addressPCSAlarms.includes(address)) {
                                        const tags = await TagnameModel.find({
                                            address: address,
                                            bit: { $ne: null },
                                        })
                                            .select({
                                                bit: 1,
                                                name: 1,
                                                symbol: 1,
                                                note: 1,
                                            })
                                            .lean()
                                        if (tags.length >= 1) {
                                            const bits = Array.from(
                                                { length: 16 },
                                                (_, i) => (data >> i) & 1,
                                            )
                                            data = Object.fromEntries(
                                                tags.map((t) => [
                                                    t._id.toString(),
                                                    bits[t.bit],
                                                ]),
                                            )
                                        }
                                    } else {
                                        data = {
                                            [tagname._id.toString()]: data,
                                        }
                                    }
                                    this.datas = { ...this.datas, ...data }
                                } catch (error) {
                                    this.datas[_id] = null
                                    logger.error(
                                        `Đọc và xử lý dữ liệu functionCode 4 lỗi ${address}`,
                                    )
                                    logger.error(error)

                                    if (
                                        error.message &&
                                        error.message.includes('Port Not Open')
                                    ) {
                                        await this.connect(deviceId)
                                    }
                                }
                                break
                            }
                        }

                        //Check genset status. Nếu genset = 1 thì BESS COTROL Tắt hết
                        if (address == 100 && this.datas[_id] == 1) {
                            try {
                                await this.devices[
                                    tagname.deviceId.toString()
                                ].writeRegister(
                                    controlConstant.ADDRESS_CHARGE_MODE,
                                    0,
                                )
                                await this.devices[
                                    tagname.deviceId.toString()
                                ].writeRegister(
                                    controlConstant.ADDRESS_DEMAND_POWER,
                                    0,
                                )
                            } catch (error) {
                                logger.error(
                                    'Lỗi Write StandBy khi genset status = 1',
                                )
                                logger.error(error.message)
                            }
                        }
                    }
                } catch (error) {
                    logger.error('Cron readData bị lỗi')
                    logger.error(error)
                } finally {
                    this.isReading = false
                }
            })
            this.readDataCron.start()
        } catch (error) {
            logger.error('readData lỗi')
            logger.error(error)
        }
    }

    this.writeData = async (addr, value) => {
        try {
            const tagname = await TagnameModel.findOne({ address: addr })
            const rawData = await this.devices[
                tagname.deviceId.toString()
            ].writeRegister(addr, value)

            logger.info(`writeData ở ${addr} giá trị ${value}`)
            return rawData
        } catch (error) {
            logger.error('writeData lỗi')
            logger.error(error)
        }
    }

    this.readSingleData = async (addr, len) => {
        try {
            const tagname = await TagnameModel.findOne({ address: addr })
            let rawData = 0
            if (tagname.functionCode == 4) {
                rawData = await this.devices[
                    tagname.deviceId.toString()
                ]?.readInputRegisters(addr, len)
            } else {
                rawData = await this.devices[
                    tagname.deviceId.toString()
                ]?.readHoldingRegisters(addr, len)
            }

            let data = getDataByDataType(rawData.buffer, tagname.dataType)
            return data
        } catch (error) {
            logger.error(`readSingleData lỗi ở ${addr} giá trị ${len}`)
            logger.error(error)
        }
    }

    this.getValueByName = async (tags) => {
        const deviceHandler = new DeviceHandler()
        const tagValues = deviceHandler.datas

        let tagnames = await TagnameModel.find({
            name: { $in: tags },
        })
            .select({
                name: 1,
                symbol: 1,
                unit: 1,
                note: 1,
            })
            .lean()

        const tagnameValues = tagnames.map((tag) => ({
            ...tag,
            value: tagValues[tag._id?.toString()] ?? null,
        }))

        return tagnameValues
    }

    DeviceHandler.instance = this
    return this
}

module.exports = DeviceHandler
