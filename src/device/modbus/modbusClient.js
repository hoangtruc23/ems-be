const ModbusSerial = require('modbus-serial')
const { logger } = require('../../config/loggerConfig')

function ModbusHandler(device) {
    this.client = null
    this.device = device
    this.connectRTU = async () => {
        try {
            let { urlPort, baudRate, dataBit, stopBit, parity, slaveId } =
                this.device
            const client = new ModbusSerial()
            client.setTimeout(1000)
            const option = {
                baudRate: Number(baudRate),
                dataBits: Number(dataBit),
                stopBits: Number(stopBit),
                parity: parity,
            }
            await client.connectRTUBuffered(urlPort, option)
            client.setID(slaveId)
            this.client = client
            return client
        } catch (error) {
            throw error
        }
    }

    this.connectAsciiSerial = async () => {
        try {
            const {
                urlPort,
                baudrate,
                dataBit,
                stopBit,
                parity,
                startOfSlaveFrameChar,
                slaveId,
            } = this.device
            const client = new ModbusSerial()
            client.setTimeout(1000)
            const option = {
                baudRate: Number(baudrate),
                dataBits: Number(dataBit),
                stopBits: Number(stopBit),
                parity: parity,
                startOfSlaveFrameChar,
            }
            await client.connectAsciiSerial(urlPort, option)
            client.setID(slaveId)
            this.client = client
            return client
        } catch (error) {
            throw error
        }
    }

    this.connectTCP = async () => {
        try {
            const { config } = this.device
            console.log(`---> [DEBUG Modbus] Đang thử kết nối thiết bị: Host=${config.host}, Port=${config.port}, SlaveID=${config.slaveId}`);
            
            const client = new ModbusSerial()
            await client.setTimeout(3000)
            await client.connectTCP(config.host, { port: Number(config.port) })
            client.setID(config.slaveId)
            this.client = client
            return client
        } catch (error) {
            throw error
        }
    }

    this.readCoils = async (addr, len) => {
        try {
            if (this.client) {
                const data = await this.client.readCoils(addr, len)
                return data.data[0]
            }
        } catch (error) {
            throw error
        }
    }

    this.readDiscreteInputs = async (addr, len) => {
        try {
            if (this.client) {
                return await this.client.readDiscreteInputs(addr, len)
            }
        } catch (error) {
            throw error
        }
    }

    this.readHoldingRegisters = async (addr, len) => {
        try {
            if (this.client) {
                console.log('[DEBUG modbusClient readHoldingRegisters]', { addr, len })
                this.client.setTimeout(2000);
                const response = await this.client.readHoldingRegisters(addr, len)
                console.log('[DEBUG modbusClient readHoldingRegisters OK]', { addr, len, response })
                return response
            }
            console.warn('[DEBUG modbusClient readHoldingRegisters no client]', { addr, len })
        } catch (error) {
            console.error('[DEBUG modbusClient readHoldingRegisters ERROR]', {
                addr,
                len,
                message: error?.message,
                stack: error?.stack,
            })
            throw error
        }
    }

    this.readInputRegisters = async (addr, len) => {
        try {
            if (this.client) {
                console.log('[DEBUG modbusClient readInputRegisters]', { addr, len })
                this.client.setTimeout(2000);
                const response = await this.client.readInputRegisters(addr, len)
                console.log('[DEBUG modbusClient readInputRegisters OK]', { addr, len, response })
                return response
            }
            console.warn('[DEBUG modbusClient readInputRegisters no client]', { addr, len })
        } catch (error) {
            console.error('[DEBUG modbusClient readInputRegisters ERROR]', {
                addr,
                len,
                message: error?.message,
                stack: error?.stack,
            })
            throw error
        }
    }

    this.writeCoil = async (addr, value, id) => {
        try {
            if (this.client) {
                return await this.client.writeCoil(addr, value)
            }
        } catch (error) {
            throw error
        }
    }

    this.writeRegister = (addr, value) => {
        try {
            if (this.client) {
                this.client.writeRegister(addr, value)
            }
        } catch (error) {
            throw error
        }
    }

    this.close = () => {
        if (this.client) {
            try {
                this.client.close(() => logger.info('Connection closed'))
            } catch (e) {
                logger.error('Close error:', e.message)
            }
        }
    }
}

module.exports = ModbusHandler
