const { CronJob } = require('cron')
const { logger } = require('../config/loggerConfig')
const DeviceModel = require('../models/device')
const TagnameModel = require('../models/tagname')
const {
    getDataByteOfAddress,
    getDataByDataType,
} = require('../utils/modbus/modbusHelper')
const ModbusHandler = require('./modbus/modbusClient')
const SiemenHandler = require('./modbus/siemenHandler')
const MqttHandler = require('./mqtt/mqttHandler')
// class ReadTimeoutError extends Error {
//     constructor(message) {
//         super(message)
//         this.name = 'ReadTimeoutError'
//     }
// }

function DeviceHandler() {
    if (typeof DeviceHandler.instance === 'object') {
        return DeviceHandler.instance
    }
    this.devices = {}
    this.datas = {}
    this.connectionDevice = []
    this.readDataCron = null
    this.reconnectDevice = {}
    this.isReading = false

    this.connectAll = async () => {
        try {
            const devices = await DeviceModel.find().select('_id')
            await Promise.all(
                devices.map((device) => this.connect(device._id.toString())),
            )
            this.readData()
        } catch (error) {
            logger.error(`ConnectAll lỗi`)
            logger.error(error)
        }
    }

    this.connect = async (deviceId) => {
        if (this.reconnectDevice[deviceId]) {
            clearTimeout(this.reconnectDevice[deviceId])
            this.reconnectDevice[deviceId] = null
        }

        const device = await DeviceModel.findById(deviceId)
        const did = device._id.toString()
        let deviceStatus = this.connectionDevice.find(c => c.deviceId === did)
        if (!deviceStatus) {
            deviceStatus = { deviceId: did, connected: false }
            this.connectionDevice.push(deviceStatus);
        } else {
            deviceStatus.connected = false
        }

        if (device.isEnable) {
            try {
                switch (device.protocol) {
                    case 'modbus_tcp':
                        if (this.devices[deviceId]) {
                            await this.devices[deviceId].close() // Disconnect IP
                            delete this.devices[deviceId]
                        }
                        this.devices[deviceId] = null
                        const modbusHandler = new ModbusHandler(device)
                        this.devices[deviceId] = modbusHandler
                        await modbusHandler.connectTCP()
                        break
                    case 'siemens_s7':
                        const s7Handler = new SiemenHandler(device)
                        this.devices[deviceId] = s7Handler
                        await s7Handler.connect()
                        break
                    case 'mqtt':
                        const mqttHandler = new MqttHandler(device, this)
                        this.devices[deviceId] = mqttHandler
                        await mqttHandler.connect()
                        break
                    default:
                        throw new Error(
                            `Giao thức ${device.protocol} không được hỗ trợ!`,
                        )
                }

                deviceStatus.connected = true
                logger.info(
                    `Thiết bị ${device.deviceName} đã kết nối thành công!`,
                )

                if (this.reconnectDevice[deviceId]) {
                    clearTimeout(this.reconnectDevice[deviceId])
                    this.reconnectDevice[deviceId] = null
                }
            } catch (error) {
                deviceStatus.connected = false

                logger.error(`Connect ${device.deviceName} lỗi`)
                logger.error(error)

                if (!this.reconnectDevice[deviceId]) {
                    this.reconnectDevice[deviceId] = setTimeout(() => {
                        this.connect(deviceId)
                    }, 5000)
                }
            }
        } else {
            deviceStatus.connected = false
            this.disconnect(deviceId)
        }
    }

    this.disconnect = async (deviceId) => {
        const device = await DeviceModel.findById(deviceId)
        try {
            logger.warn(`Thiết bị ${device.deviceName} tắt kết nối!`)
            switch (device.protocol) {
                case "modbus_tcp":
                    if (this.devices[deviceId]) {
                        await this.devices[deviceId].close() // Disconnect IP
                        delete this.devices[deviceId]
                    }
                    logger.info(`Đã ngắt kết nối thiết bị ${device.deviceName}`)
                    if (this.reconnectDevice[deviceId]) {
                        clearTimeout(this.reconnectDevice[deviceId])
                        this.reconnectDevice[deviceId] = null
                    }
                    break;
                case "siemens_s7":
                    if (this.devices[deviceId]) {
                        await this.devices[deviceId].close()
                        logger.info(`Đã ngắt kết nối thiết bị ${device.deviceName}`)
                    }
                    delete this.devices[deviceId]
                    if (this.reconnectDevice[deviceId]) {
                        clearTimeout(this.reconnectDevice[deviceId])
                        this.reconnectDevice[deviceId] = null
                    }
                    break;
                case "mqtt":
                    if (this.devices[deviceId]) {
                        await this.devices[deviceId].close()
                        logger.info(`Đã ngắt kết nối thiết bị ${device.deviceName}`)
                    }
                    delete this.devices[deviceId]
                    if (this.reconnectDevice[deviceId]) {
                        clearTimeout(this.reconnectDevice[deviceId])
                        this.reconnectDevice[deviceId] = null
                    }
                    break;
                default:
                    throw new Error(
                        `Giao thức ${device.protocol} không được hỗ trợ!`,
                    )
            }
        } catch (error) {
            logger.error(`Disconnect ${device.deviceName} lỗi`)
            logger.error(error)
        }
    }

    this.readData = async () => {
        try {
            // prevent creating multiple CronJobs
            if (this.readDataCron) {
                if (this.readDataCron.running) return
            }

            const allTags = await TagnameModel.find({ bit: null }).lean()
            this.readDataCron = new CronJob(`*/5 * * * * *`, async () => {
                if (this.isReading) {
                    // logger.warn('Cron trước chưa đọc xong, bỏ qua lần này.')
                    return
                }
                try {
                    this.isReading = true

                    // PHÂN NHÓM TAG THEO THIẾT BỊ
                    const deviceGroups = {};
                    allTags.forEach(tag => {
                        const device = tag.deviceId?.toString();
                        if (!device) return;
                        if (!deviceGroups[device]) deviceGroups[device] = [];
                        deviceGroups[device].push(tag);
                    });

                    await Promise.all(Object.entries(deviceGroups).map(async ([deviceId, tags]) => {
                        const deviceStatus = this.connectionDevice.find(item => item.deviceId === deviceId);
                        // const deviceStatus = device?.connected;
                        const client = this.devices[deviceId];

                        //DÙNG ID CỦA TAGNAME
                        if (!client || !deviceStatus?.connected) {
                            tags.forEach(t => this.datas[t._id] = null);
                            return;
                        }

                        // Kiểm tra nếu là thiết bị siemens_s7
                        if (client.device?.protocol === 'siemens_s7') {
                            if (!client.status) {
                                if (deviceStatus.connected) {
                                    deviceStatus.connected = false;
                                    tags.forEach(t => this.datas[t._id.toString()] = null);
                                    this.connect(deviceId);
                                }
                                return;
                            }
                            tags.forEach(tag => {
                                const val = client.data ? client.data[tag.address] : null;
                                this.datas[tag._id.toString()] = val ?? null;
                            });
                            return;
                        }

                        // Kiểm tra nếu là thiết bị mqtt
                        if (client.device?.protocol === 'mqtt') {
                            if (!client.status) {
                                if (deviceStatus.connected) {
                                    deviceStatus.connected = false;
                                    tags.forEach(t => this.datas[t._id.toString()] = null);
                                    this.connect(deviceId);
                                }
                            }
                            return;
                        }

                        // 4. TÌM DẢI ĐỊA CHỈ (MIN - MAX) ĐỂ ĐỌC 1 LẦN
                        const funcCodes = [3, 4];
                        for (const fc of funcCodes) {
                            if (!deviceStatus.connected) break;
                            const tagsOfFC = tags.filter(t => t.functionCode === fc && t.bit === null);
                            if (tagsOfFC.length === 0) continue;
                            //Chia thành các length cụm 
                            const tagChunks = this.groupTagsByRange(tagsOfFC, 100);

                            for (const chunk of tagChunks) {
                                if (!deviceStatus.connected) break;
                                const addresses = chunk.map(t => Number(t.address));

                                const minAddr = Math.min(...addresses);
                                const maxAddr = Math.max(...addresses);
                                const readLength = maxAddr - minAddr + 2;

                                try {
                                    let response = null;
                                    if (fc === 3) response = await client.readHoldingRegisters(minAddr, readLength);
                                    else if (fc === 4) response = await client.readInputRegisters(minAddr, readLength);
                                    if (response?.buffer) {
                                        const chunkAddresses = new Set(addresses);

                                        const relatedTags = tags.filter(t => t.functionCode === fc && chunkAddresses.has(Number(t.address)));
                                        relatedTags.forEach(tag => {
                                            const offsetInBytes = (tag.address - minAddr) * 2; // Mỗi register là 2 bytes
                                            if (offsetInBytes < 0 || offsetInBytes >= response.buffer.length) return;

                                            const slice = response.buffer.slice(offsetInBytes);
                                            let value = getDataByDataType(slice, tag.dataType);
                                            // Xử lý Bit nếu có
                                            if (tag.bit !== null) {
                                                value = (value >> tag.bit) & 1;
                                            } else {
                                                // Áp dụng Gain/Offset cho tag thường
                                                if (tag.gain !== undefined && tag.offset !== undefined) {
                                                    value = value * tag.gain + tag.offset;
                                                }
                                            }
                                            // this.datas[tag.name]c = value;
                                            this.datas[tag._id.toString()] = value;


                                        });
                                    }
                                } catch (err) {
                                    logger.error(`Lỗi đọc cụm ${minAddr}-${maxAddr}: ${err.message}`);
                                    if (deviceStatus.connected) {
                                        deviceStatus.connected = false;
                                        tags.forEach(t => this.datas[t._id.toString()] = null);
                                        this.connect(deviceId);
                                    }
                                }
                            }
                        }
                    }));
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

    this.getValueGroupDevice = async () => {
        const tagValues = this.datas;

        let tagnames = await TagnameModel.find({})
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

        return groupedData
    }

    this.groupTagsByRange = (tags, limit = 120) => {
        if (tags.length === 0) return [];

        // Sắp xếp tag theo địa chỉ tăng dần
        const sortedTags = [...tags].sort((a, b) => a.address - b.address);
        const groups = [];
        let currentGroup = [sortedTags[0]];

        for (let i = 1; i < sortedTags.length; i++) {
            const firstInGroup = currentGroup[0];
            const currentTag = sortedTags[i];

            // Kiểm tra nếu thêm tag này vào thì dải có vượt quá limit không
            if (currentTag.address - firstInGroup.address < limit) {
                currentGroup.push(currentTag);
            } else {
                groups.push(currentGroup);
                currentGroup = [currentTag];
            }
        }
        groups.push(currentGroup);
        return groups;
    }

    DeviceHandler.instance = this
    return this
}

module.exports = DeviceHandler
