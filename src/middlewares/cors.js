const cors = require('cors')
const whitelist = []
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(response.cors())
        }
    },
}
const corsMiddleware = [
    cors(),
    (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        next()
    },
]
module.exports = corsMiddleware
