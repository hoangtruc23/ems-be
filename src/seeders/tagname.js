const { logger } = require('../config/loggerConfig')
const TagnameModel = require('../models/tagname')

async function tagnameSeeder() {
    await TagnameModel.deleteMany({})
    await TagnameModel.insertMany([
        //ADDRESS WORKING
        {
            name: 'consumption',
            symbol: 'Consumption',
            functionCode: 4,
            address: 1,
            dataType: 3,
            unit: 'kWh',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'current',
            symbol: 'Current',
            functionCode: 4,
            address: 2,
            dataType: 3,
            unit: 'A',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'voltage',
            symbol: 'Voltage',
            functionCode: 4,
            address: 3,
            dataType: 3,
            unit: 'V',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'load',
            symbol: 'Load',
            functionCode: 4,
            address: 4,
            dataType: 3,
            unit: 'kW',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'frequency',
            symbol: 'Frequency',
            functionCode: 4,
            address: 5,
            dataType: 3,
            unit: 'kW',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'powerFactor',
            symbol: 'Power Factor',
            functionCode: 4,
            address: 6,
            dataType: 3,
            unit: '',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'activeMeters',
            symbol: 'Active Meters',
            functionCode: 4,
            address: 7,
            dataType: 3,
            unit: '',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'demand',
            symbol: 'Demand', //nhu cầu  Peak Demand = Nhu cầu đỉnh điểm / Nhu cầu cao điểm
            functionCode: 4,
            address: 8,
            dataType: 3,
            unit: 'kW',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'co2Emission', // Khí thải CO2
            symbol: 'CO2 Emission', //nhu cầu  Peak Demand = Nhu cầu đỉnh điểm / Nhu cầu cao điểm
            functionCode: 4,
            address: 9,
            dataType: 3,
            unit: 'ton',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'voltageTHD', //
            symbol: 'Voltage THD', //Cho biết con số V kia có đang bị sóng hài làm nhiễu, méo mó hay không (càng nhỏ càng tốt, dưới 5% là điện sạch).
            functionCode: 4,
            address: 9,
            dataType: 3,
            unit: 'ton',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        {
            name: 'voltageImbalance', // Cho biết điện áp giữa các pha
            symbol: 'Voltage Imbalance', //(càng nhỏ càng tốt, dưới 1% là rất cân bằng)
            functionCode: 4,
            address: 9,
            dataType: 3,
            unit: 'ton',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: '',
        },
        // {
        //     name: 'cost', // Cost 
        //     symbol: 'Cost', //Cost = kWh × Tariff
        //     functionCode: 4,
        //     address: 9,
        //     dataType: 3,
        //     unit: 'ton',
        //     offset: 0,
        //     gain: 1,
        //     deviceId: '684bcaeb7cac1b319680bf0a',
        //     isSaveDb: false,
        //     note: '',
        // },
    ])
        .then(() => {
            logger.info('Tagname Seeder Done')
        })
        .catch((err) => {
            logger.error('Tagname Seeder Failed', err)
        })
}

module.exports = tagnameSeeder
