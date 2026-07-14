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
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { fullname: { $regex: search, $options: 'i' } }
                ];
            }

            const [users, totalItems] = await Promise.all([
                UserModel.find(filter, { password: 0, __v: 0 })
                    .skip(skip)
                    .limit(limit)
                    .populate('role', 'name')
                    .lean(),
                UserModel.countDocuments(filter)
            ]);

            const formattedUsers = users.map(user => {
                if (user.role && user.role.name) {
                    user.role = user.role.name;
                } else {
                    user.role = null;
                }
                return user;
            });

            const totalPages = Math.ceil(totalItems / limit);

            return {
                users: formattedUsers,
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
            const { fullname, username, password, role } = user
            const checkUsername = await UserModel.findOne({ username })
            if (checkUsername) {
                throw new BadReq(errorCode.USER_EXISTED)
            }

            const hashPass = await bcrypt.hash(password, 10)

            await UserModel.create({
                fullname,
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
                .populate('role', 'name')
                .lean()

            if (!data) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

            if (data.role && data.role.name) {
                data.role = data.role.name;
            } else {
                data.role = null;
            }

            return data
        } catch (error) {
            throw error
        }
    },
    update: async (userId, user) => {
        try {
            const { fullname, username, role } = user

            if (username) {
                const checkUsername = await UserModel.findOne({ username, _id: { $ne: userId } })
                if (checkUsername) {
                    throw new BadReq(errorCode.USER_EXISTED)
                }
            }

            let data = await UserModel.findByIdAndUpdate(
                userId,
                {
                    fullname,
                    username,
                    role,
                },
                {
                    new: true,
                    projection: { password: 0, __v: 0 },
                },
            )

            if (!data) {
                throw new BadReq(errorCode.USER_NOT_FOUND)
            }

            data = await data.populate('role', 'name');
            const dataObj = data.toObject();

            if (dataObj.role && dataObj.role.name) {
                dataObj.role = dataObj.role.name;
            } else {
                dataObj.role = null;
            }

            return data
        } catch (error) {
            throw error
        }
    },
    updateProfile: async (userId, user) => {
        try {
            const { fullname, username } = user

            if (username) {
                const checkUsername = await UserModel.findOne({ username, _id: { $ne: userId } })
                if (checkUsername) {
                    throw new BadReq(errorCode.USER_EXISTED)
                }
            }

            const data = await UserModel.findByIdAndUpdate(
                userId,
                { fullname, username },
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
            if (!passwordNew) {
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
