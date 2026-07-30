const reportService = require('../services/reportService')
const response = require('../utils/response/response')
const moment = require('moment-timezone')

const reportController = {
    getDailyMetersTable: async (req, res, next) => {
        try {
            const result = await reportService.getDailyMetersTable(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getDailyAlarms: async (req, res, next) => {
        try {
            const result = await reportService.getDailyAlarms(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getDailyEnergyCharts: async (req, res, next) => {
        try {
            const result = await reportService.getDailyEnergyCharts(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getEnergyReport: async (req, res, next) => {
    console.log(">>> [Controller] Bắt đầu xử lý getEnergyReport với query:", req.query);
    try {
        const result = await reportService.getEnergyReport(req.query); //[cite: 2]
        console.log(">>> [Controller] Xử lý thành công, trả về data!");
        return res.status(200).json(response.success(result)); //[cite: 2]
    } catch (error) {
        console.error(">>> [Controller] LỖI RỒI:", error);
        
        // Tạm thời bỏ next(error) để chặn treo request
        // next(error) 
        
        // Trả thẳng lỗi ra PowerShell/Postman
        return res.status(500).json({
            message: "Đã xảy ra lỗi trong quá trình xử lý báo cáo năng lượng",
            errorName: error.name,
            errorMessage: error.message
        });
    }
},
    getChartDashboard: async (req, res, next) => {
        try {
            const result = await reportService.getChartDashboard(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    chartMonitoring: async (req, res, next) => {
        try {
            const result = await reportService.chartMonitoring(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    getAll: async (req, res, next) => {
        try {
            const result = await reportService.getDataControlChart(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    controlTable: async (req, res, next) => {
        try {
            const result = await reportService.controlTable(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    generateChart: async (req, res, next) => {
        try {
            const result = await reportService.generateChart(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
    generateTableReport: async (req, res, next) => {
        try {
            const result = await reportService.generateTableReport(req.query)
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },

    //GRID
    getChartVoltage: async (req, res, next) => {
        try {
            const result = await reportService.getChartVoltage()
            return res.status(200).json(response.success(result))
        } catch (error) {
            next(error)
        }
    },
}

module.exports = reportController
