// create an empty modbus client
const ModbusRTU = require('modbus-serial')
const client = new ModbusRTU()

// open connection to a tcp line
client.connectTCP('127.0.0.1', { port: 502 })
client.setID(1)

// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function () {
    client.readHoldingRegisters(100, 10, function (err, data) {
        console.log(data)
    })
}, 1000)
