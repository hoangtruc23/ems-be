const { logger } = require('../config/loggerConfig')
const TagnameModel = require('../models/tagname')

async function tagnameSeeder() {
    await TagnameModel.deleteMany({})
    await TagnameModel.insertMany([
        //ADDRESS WORKING
        {
            name: 'bessCurrent',
            symbol: 'Overload Alarm',
            functionCode: 4,
            address: 5072,
            bit: 14,
            dataType: 3,
            unit: '',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: 'Bit14: Overload Alarm',
        },
        {
            name: 'pcs2ExternalContactorFault',
            symbol: 'External Contactor Fault',
            functionCode: 4,
            address: 5072,
            bit: 15,
            dataType: 3,
            unit: '',
            offset: 0,
            gain: 1,
            deviceId: '684bcaeb7cac1b319680bf0a',
            isSaveDb: false,
            note: 'Bit15: External Contactor Fault',
        },
    ])
        .then(() => {
            logger.info('Tagname Seeder Done')
        })
        .catch((err) => {
            logger.error('Tagname Seeder Failed', err)
        })
}

module.exports = tagnameSeeder
