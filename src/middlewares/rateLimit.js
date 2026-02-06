const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Request quá nhiều',
    skipSuccessfulRequests: true,
    handler: (req, res, next, option) => {
        next({
            status: option.statusCode,
            code: -1,
            message: option.message,
            data: null,
        })
    },
})

module.exports = limiter
