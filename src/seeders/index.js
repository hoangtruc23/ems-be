require('../config/mongodbConfig')
const { logger } = require('../config/loggerConfig')
const roleSeeder = require('./role')
const deviceSeeder = require('./device')
const tagnameSeeder = require('./tagname')
const userSeeder = require('./user')
const configFtpSeeder = require('./configFtp')
const settingSeeder = require('./setting')

const args = process.argv.slice(2)

async function run() {
    try {
        switch (args[0]) {
            case 'user': {
                await userSeeder()
                break
            }
            // case 'role': {
            //     await roleSeeder()
            //     break
            // }
            case 'device': {
                await deviceSeeder()
                break
            }
            case 'tagname': {
                await tagnameSeeder()
                break
            }
            case 'setting': {
                await settingSeeder()
                break
            }

            case 'all': {
                await userSeeder()
                await settingSeeder()
                // await roleSeeder()
                await deviceSeeder()
                await tagnameSeeder()
                await configFtpSeeder()
                break
            }
        }
        logger.info('Seeding completed')
    } catch (error) {
        logger.error('Seeding failed:', error)
    } finally {
        process.exit(1)
    }
}

run()
