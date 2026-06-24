const nodes7 = require('nodes7')
const { CronJob } = require('cron')
const { logger } = require('../../config/loggerConfig')

// const PlcConfigModel = require('../models/plcConfig')
// const { getAllPlcAddress, saveSensorValue } = require('../utils/helper/plc')
// const { clientRedis } = require('../config/redisConfig')
// const constant = require('../utils/constant/constant')
// const StreamConfigModel = require('../models/streamConfig')
// const AlarmModel = require('../models/alarm')

function SiemenHandler(device) {
    this.device = device
    this.s7Client
    this.readDataCron = null
    this.data = {}
    this.dataOfDeviceSpecial = {}
    this.status = null
    this.alarm = {}
    this.alarmDisconnect = false

    this.connect = async () => {
        try {
            // const plcConfig = await PlcConfigModel.findOne()
            // const streamConfig = await StreamConfigModel.findOne()
            const { config } = this.device
            const s7 = new nodes7({ silent: true })
            await new Promise((resolve, reject) => {
                s7.initiateConnection(
                    { host: config.host, port: config.port, rack: config.rack, slot: config.slot, timeout: 3000, debug: false },
                    (err) => {
                        if (err) {
                            logger.error('[SIEMEN] Connect thất bại', err)
                            reject(err)
                        } else {
                            logger.info('[SIEMEN] Connect thành công')
                            this.s7Client = s7
                            this.status = true
                            this.readData()
                            resolve()
                        }
                    },
                )
            })
        } catch (error) {
            setTimeout(() => {
                this.connect()
            }, 5000)
            logger.error(error)
            throw error
        }
    }

    this.close = () => {
        if (this.s7Client) {
            try {
                this.s7Client.disconnect(() => {
                    this.s7Client = null;
                    logger.info('Connection closed');
                });
            } catch (e) {
                logger.error('Close error:', e.message);
            }
        } else {
            logger.warn('s7Client is already undefined or null');
        }
    }

    this.readData = async () => {
        try {
            if (!this.s7Client) {
                throw new Error('[SIEMEN] Chưa kết nối được đến thiết bị')
            }
            setInterval(async () => {
                const ts = Date.now()
                let saveToDbDatas = []
                const nodeS7Addresses = await getAllPlcAddress()
                this.s7Client.removeItems()
                nodeS7Addresses.push('I0.1', 'I0.3', 'I0.6', 'I1.1', 'I18.5')
                this.s7Client.addItems(nodeS7Addresses)
                this.s7Client.readAllItems(async (err, data) => {
                    if (err) {
                        this.data = null
                        this.status = false
                    } else {
                        if (!this.status) {
                            // Get streamConfig để set streamConfig xuống PLC khi connect lại
                            const streamConfigCache = await clientRedis.get(
                                constant.STREAM_CONFIG_CACHE,
                            )
                            const streamConfig = JSON.parse(streamConfigCache)
                            this.writeData(
                                streamConfig.sampleCycle.address,
                                streamConfig.sampleCycle.value,
                            )
                        }
                        this.status = true
                        this.alarmDisconnect = false
                        this.data = data
                    }
                })
            }, 500)
        } catch (error) {
            logger.error(error)
        }
    }
    this.writeData = async (address, value) => {
        try {
            return new Promise((resolve, reject) => {
                this.s7Client?.writeItems(address, value, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            })
        } catch (error) {
            logger.error(error)
        }
    }
}

module.exports = SiemenHandler