const moment = require('moment-timezone')
const downloadService = require('../services/downloadService')

const downloadController = {
    downloadGenerateTable: async (req, res, next) => {
        try {
            const result = await downloadService.downloadGenerateTable(
                req.query,
            )
            const fileName = `Report_${moment().format('YYYYMMDD_HHmmss')}.csv`

            // Content-Type cho CSV
            res.setHeader('Content-Type', 'text/csv; charset=utf-8')
            // Content-Disposition attachment giúp browser hiểu là cần download
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=${fileName}`,
            )

            // Gửi Buffer về
            res.send(result)
        } catch (error) {
            next(error)
        }
    },
    downloadMeterIndex: async (req, res, next) => {
        try {
            const result = await downloadService.downloadMeterIndex(req.query)
            const fileName = `ReportMeterIndex_${moment().format('YYYYMMDD_HHmmss')}.csv`

            // Content-Type cho CSV
            res.setHeader('Content-Type', 'text/csv; charset=utf-8')
            // Content-Disposition attachment giúp browser hiểu là cần download
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=${fileName}`,
            )

            // Gửi Buffer về
            res.send(result)
        } catch (error) {
            next(error)
        }
    },
}

module.exports = downloadController
