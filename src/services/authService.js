const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const UserModel = require('../models/user')
const { envConfig } = require('../config/envConfg')
const { clientRedis } = require('../config/redisConfig')
const BadReq = require('../utils/response/requestError')
const constant = require('../utils/constant/constant')
const errorCode = require('../utils/response/errorCode')

const authService = {
    login: async (username, password) => {
        try {
            console.log('[AUTH SERVICE] step 1 find user')
            const user = await UserModel.findOne({ username }).lean()
            console.log('[AUTH SERVICE] step 1 done', !!user)
            if (!user) {
                throw new BadReq(errorCode.INCORRECT_USERNAME)
            }
            console.log('[AUTH SERVICE] step 2 compare password')
            const comparePassword = await bcrypt.compare(
                password,
                user.password,
            )
            console.log('[AUTH SERVICE] step 2 done', comparePassword)

            if (!comparePassword) {
                throw new BadReq(errorCode.INCORRECT_PASSWORD)
            }
            delete user.password
            const ts = Date.now()
            const accessToken = jwt.sign(
                { user: user, ts },
                envConfig.JWT_ACCESS_TOKEN_PRIVATE_KEY,
                { expiresIn: Number(envConfig.JWT_ACCESS_TOKEN_EXPIRES) },
            )

            // set redis
            console.log('[AUTH SERVICE] step 3 set redis')
            await clientRedis.set(
                `${constant.REDIS_PREFIX_ACCESS_TOKEN}_${user._id}_${ts}`,
                accessToken,
                {
                    EX: envConfig.JWT_ACCESS_TOKEN_EXPIRES,
                },
            )
            console.log('[AUTH SERVICE] step 3 done')

            return accessToken
        } catch (error) {
            throw error
        }
    },
    logout: async (payloadToken) => {
        try {

            const userId = payloadToken.user?._id; 
            const timestamp = payloadToken.ts;

            await clientRedis.del(
                `${constant.REDIS_PREFIX_ACCESS_TOKEN}_${userId}_${timestamp}`,
            )
            return null
        } catch (error) {
            throw error
        }
    },
    getUserLoginDetail: async (currentUser) => {
        try {
            const user = await UserModel.findById(currentUser._id, {
                password: 0,
                __v: 0,
            })
            .populate('role', 'name')
            .lean()

            if (!user) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

            if (user.role && user.role.name) {
                user.role = user.role.name;
            } else {
                user.role = null;
            }

            return user
        } catch (error) {
            throw error
        }
    },
}

module.exports = authService
