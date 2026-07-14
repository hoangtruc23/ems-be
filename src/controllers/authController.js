const jwt = require('jsonwebtoken')
const authService = require('../services/authService')
const response = require('../utils/response/response')
const { envConfig } = require('../config/envConfg')
const userService = require('../services/userService')
const BadReq = require('../utils/response/requestError')
const errorCode = require('../utils/response/errorCode')

const authController = {
    login: async (req, res, next) => {
        try {
            const { username, password } = req.body
            const accessToken = await authService.login(username, password)
            return res.status(200).json(response.success(accessToken))
        } catch (error) {
            next(error)
        }
    },
    logout: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]

            if (!token) {
                throw new BadReq(errorCode.INVALID_TOKEN);
            }   
            
            const payloadToken = jwt.verify(
                token,
                envConfig.JWT_ACCESS_TOKEN_PRIVATE_KEY,
            )
            const logout = await authService.logout(payloadToken)
            return res.status(200).json(response.success(logout))
        } catch (error) {
            next(error)
        }
    },
    getUserLoginDetail: async (req, res, next) => {
        try {
            const user = await authService.getUserLoginDetail(req.user)
            return res.status(200).json(response.success(user))
        } catch (error) {
            next(error)
        }
    },
    changePassword: async (req, res, next) => {
        try {
            const userId = req.user?._id || req.user?.id || req.userId;

            const result = await userService.changePassword(
                userId,
                req.body,
            )
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = authController
