const ReportConfigModel = require('../models/reportConfig')

async function reportConfigSeeder() {
    await ReportConfigModel.deleteMany({})
    await ReportConfigModel.insertMany([
        {
            tariff: 0,
            savingEnergy: 0,
            threshold: 0,
            emissionFactor: 0.6592,
            energyTagName: 'gridTotal',
            demandTagName: 'demandPower',
            pfTagName: 'gridPowerFactor',
            isActive: true,
        },
    ])
}

module.exports = reportConfigSeeder
