const UserModel = require('../models/user')
const BadReq = require('../utils/response/requestError')
const errorCode = require('../utils/response/errorCode')
const bcrypt = require('bcryptjs')

const userService = {
    getAll: () => {
        try {
            const data = UserModel.find({}, { password: 0, __v: 0 })
            return data
        } catch (error) {
            throw error
        }
    },
    create: async (user) => {
        try {
            const { username, password, role } = user
            const checkUsername = await UserModel.findOne({ username })
            if (checkUsername) {
                throw new BadReq(errorCode.USER_EXISTED)
            }

            const hashPass = await bcrypt.hash(password, 10)

            await UserModel.create({
                username,
                password: hashPass,
                role,
            })

            return null
        } catch (error) {
            throw error
        }
    },
    getById: async (userId) => {
        try {
            const data = await UserModel.findById(userId, {
                password: 0,
                __v: 0,
            })

            if (!data) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

            return data
        } catch (error) {
            throw error
        }
    },
    update: async (userId, user) => {
        try {
            const { username, role } = user

            const data = await UserModel.findByIdAndUpdate(
                userId,
                {
                    username,
                    role,
                },
                {
                    new: true,
                    projection: { password: 0, __v: 0 },
                },
            )

            return data
        } catch (error) {
            throw error
        }
    },
    delete: async (userId) => {
        try {
            await UserModel.findByIdAndDelete(userId)

            return null
        } catch (error) {
            throw error
        }
    },
    changePassword: async (userId, user) => {
        try {
            const { passwordNew } = user
            const findUser = await UserModel.findById(userId)

            if (!findUser) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

            const handPass = await bcrypt.hash(passwordNew, 10)

            await UserModel.findByIdAndUpdate(userId, {
                password: handPass,
            })

            return null
        } catch (error) {
            throw error
        }
    },
}

module.exports = userService
