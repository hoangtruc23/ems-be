const mongoose = require('mongoose')
const { envConfig } = require('./envConfg')
const { logger } = require('./loggerConfig')

const DB_HOST = envConfig.DB_HOST,
    DB_PORT = envConfig.DB_PORT,
    DB_NAME = envConfig.DB_NAME,
    DB_USERNAME = envConfig.DB_USERNAME,
    DB_PASSWORD = encodeURIComponent(envConfig.DB_PASSWORD),
    LOGIN_DB =
        DB_USERNAME && DB_PASSWORD ? `${DB_USERNAME}:${DB_PASSWORD}@` : '',
    ATLAS_DB = envConfig.DB_HOST?.indexOf('mongodb') > 0

let isConnectedBefore = false
let reconnectTimeout = null

const mongoURI = `mongodb${ATLAS_DB ? '+srv' : ''}://${LOGIN_DB}${DB_HOST}${
    ATLAS_DB ? '' : `:${DB_PORT}`
}/${DB_NAME}`

const options = {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}

function connectMongoDB() {
    clearTimeout(reconnectTimeout)
    mongoose
        .connect(mongoURI, options)
        .then(() => {
            logger.info('MongoDB connected')
            isConnectedBefore = true
        })
        .catch((err) => {
            logger.error('MongoDB connection error: ')
            logger.error(err)
            if (!isConnectedBefore) {
                logger.info('Retry in 5 seconds...')
                reconnectTimeout = setTimeout(connectMongoDB, 5000)
            }
        })
}

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error: ')
    logger.error(err)
})

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
    logger.info('Will attempt reconnect in 5s...')
    reconnectTimeout = setTimeout(connectMongoDB, 5000)
})

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected')
})

mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established')
})

connectMongoDB()
