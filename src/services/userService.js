const UserModel = require('../models/user')
const BadReq = require('../utils/response/requestError')
const errorCode = require('../utils/response/errorCode')
const bcrypt = require('bcryptjs')

const userService = {
    getAll: async (query) => {
        try {
            const search = query.search || '';
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;

            const skip = (page - 1) * limit;

            const filter = {};
            if (search) {
                filter.username = { $regex: search, $options: 'i' }; 
            }

            const [users, totalItems] = await Promise.all([
                UserModel.find(filter, { password: 0, __v: 0 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                UserModel.countDocuments(filter)
            ]);

            const totalPages = Math.ceil(totalItems / limit);

            return {
                users,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: page,
                    limit
                }
            };
        } catch (error) {
            throw error;
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
    updateProfile: async (userId, user) => {
        try {
            const { username } = user

            const data = await UserModel.findByIdAndUpdate(
                userId,
                { username },
                {
                    new: true,
                    projection: { password: 0, __v: 0 },
                },
            )

            if (!data) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

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
            if(!passwordNew){
                throw new BadReq(errorCode.PASSWORD_REQUIRED)
            }
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
