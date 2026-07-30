const deviceService = require('../services/deviceService')
const response = require('../utils/response/response')

const deviceController = {
    getList: async (req, res, next) => {
        try {
            const result = await deviceService.getList()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getAll: async (req, res, next) => {
        try {
            const result = await deviceService.getAll(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getDeviceStats: async (req, res) => {
        try {
            const stats = await deviceService.getDeviceStats();
            return res.status(200).json({
                success: true,
                message: "Get device statistics successfully",
                data: stats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    },
    getAllLocation: async (req, res, next) => {
        try {
            const result = await deviceService.getAllLocation()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    create: async (req, res, next) => {
        try {
            const result = await deviceService.create(req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const result = await deviceService.update(req.params, req.body)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { deviceId } = req.params
            const result = await deviceService.delete(deviceId)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = deviceController
