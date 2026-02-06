const jwt = require('jsonwebtoken')
const response = require('../utils/response/response')
const constant = require('../utils/constant/constant')
const { envConfig } = require('../config/envConfg')
const { logger } = require('../config/loggerConfig')
const { clientRedis } = require('../config/redisConfig')

const authenticated = async (req, res, next) => {
    try {
        if (req.originalUrl.split('?')[0].endsWith('login')) {
            return next()
        }
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json(response.unauthorized('Không có token'))
        }
        const accessToken = authorization.split(' ')[1]
        let decoded
        try {
            decoded = jwt.verify(
                accessToken,
                envConfig.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            )
        } catch (error) {
            return res.status(401).json(response.unauthorized(error.message))
        }
        const token = await clientRedis.get(
            `${constant.REDIS_PREFIX_ACCESS_TOKEN}_${decoded.user._id}_${decoded.ts}`,
        )

        if (!token) {
            return res.status(401).json(response.unauthorized('Không có token'))
        }
        req.user = decoded.user
        req.tokenTs = decoded.user
        next()
    } catch (error) {
        logger.error(error)
        next(response.serverError(error))
    }
}

module.exports = { authenticated }
