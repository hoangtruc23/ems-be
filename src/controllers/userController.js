const userService = require('../services/userService')
const response = require('../utils/response/response')

const userController = {
    getAll: async (req, res, next) => {
        try {
            const { search, page, limit } = req.query;
            const result = await userService.getAll({ search, page, limit })
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await userService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getById: async (req, res, next) => {
        try {
            const { userId } = req.params
            const result = await userService.getById(userId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { userId } = req.params
            const result = await userService.update(userId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    updateProfile: async (req, res, next) => {
        try {
            const userId = req.user?._id || req.user?.id || req.userId;

            const result = await userService.updateProfile(userId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { userId } = req.params
            const result = await userService.delete(userId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    changePassword: async (req, res, next) => {
        try {
            const { userId } = req.params
            const result = await userService.changePassword(userId, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = userController
