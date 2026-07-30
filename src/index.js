const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const swaggerUi = require('swagger-ui-express')

require('./config/mongodbConfig')
require('./config/redisConfig')
require('./cron/index')

const { logger } = require('./config/loggerConfig')
const limiter = require('./middlewares/rateLimit')
const corsMiddleware = require('./middlewares/cors')
const { envConfig } = require('./config/envConfg')
const route = require('./routes')
const { authenticated } = require('./middlewares/auth')
const swaggerSpec = require('./config/swaggerConfig')
const BadReq = require('./utils/response/requestError')
const response = require('./utils/response/response')
const connectSocket = require('./socket/socket')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
})

app.use((req, res, next) => {
    const startedAt = Date.now()
    const requestId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`
    req.requestId = requestId

    logger.info(
        `[REQ ${requestId}] ${req.method} ${req.originalUrl} from ${req.ip}`,
    )

    const timer = setTimeout(() => {
        logger.warn(
            `[SLOW ${requestId}] ${req.method} ${req.originalUrl} still running after 10000ms`,
        )
    }, 10000)

    res.on('finish', () => {
        clearTimeout(timer)
        logger.info(
            `[RES ${requestId}] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${Date.now() - startedAt}ms`,
        )
    })

    res.on('close', () => {
        clearTimeout(timer)
        logger.warn(
            `[CLOSE ${requestId}] ${req.method} ${req.originalUrl} closed after ${Date.now() - startedAt}ms`,
        )
    })

    next()
})

app.use(limiter)
app.use(helmet())
app.use(corsMiddleware)
app.use(compression({ threshold: 100 * 1000 }))
app.use(envConfig.SWAGGER_URL, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(express.json())

app.use(authenticated)
app.use(envConfig.BASE_URL, route)

app.use((req, res, next) => {
    next(response.notFound())
})
app.use((error, req, res, next) => {
    if (error instanceof BadReq) {
        return res.status(error.status).json(response.badRequest(error))
    }
    logger.error(error)
    return res.status(error.status || 500).json(response.serverError(error))
})

global._io = io
global._io.on('connection', connectSocket)

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
})

const port = envConfig.PORT
server.listen(port, '0.0.0.0', (error) => {
    if (error) {
        logger.error(`Error in setup server: ${error}`)
        process.exit(1)
    }
    logger.info(`Server listing at port ${port}`)
    logger.info(
        `Swagger on http://localhost:${envConfig.PORT}${envConfig.SWAGGER_URL}`,
    )
})
