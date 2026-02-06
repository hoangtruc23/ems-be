const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const UserModel = require('../models/user')

async function userSeeder() {
    await UserModel.deleteMany({})
    await UserModel.insertMany([
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f1'),
            username: 'root',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: 'root',
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f2'),
            username: 'admin',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: 'admin',
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f3'),
            username: 'operator',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: 'operator',
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f4'),
            username: 'guest',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: 'guest',
        },
    ])
    logger.info('Users seeded')
}

module.exports = userSeeder
