const { Types } = require('mongoose')

const { logger } = require('../config/loggerConfig')
const UserModel = require('../models/user')
const { ROLE_IDS } = require('./role')

async function userSeeder() {
    await UserModel.deleteMany({})
    await UserModel.insertMany([
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f1'),
            fullname: 'Root User',
            username: 'root',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: new Types.ObjectId(ROLE_IDS.root),
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f2'),
            fullname: 'Admin User',
            username: 'admin',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: new Types.ObjectId(ROLE_IDS.admin),
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f3'),
            fullname: 'Operator User',
            username: 'operator',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: new Types.ObjectId(ROLE_IDS.operator),
        },
        {
            _id: new Types.ObjectId('68650a52d2be83be41cbd8f4'),
            fullname: 'Guest User',
            username: 'guest',
            password:
                '$2b$10$VbLYkTVZG0gy7gNoaJZCduG4B8OS8670Goz1XjRu6xC71YdJgIJF6',
            role: new Types.ObjectId(ROLE_IDS.guest),
        },
    ])
    logger.info('Users seeded')
}

module.exports = userSeeder
