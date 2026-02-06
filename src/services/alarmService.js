const AlarmModel = require('../models/alarm')

const alarmService = {
    getAll: async (query) => {
        // const { startTime, endTime } = query
        const data = await AlarmModel.find({
            status: 'unResolved',
        }).sort({ time: -1 })
        return data
    },
    update: async (alarmId) => {
        if (alarmId === 'all') {
            await AlarmModel.updateMany(
                {},
                {
                    status: 'resolved',
                },
            )
        } else {
            await AlarmModel.findByIdAndUpdate(alarmId, {
                status: 'resolved',
            })
        }
        return null
    },
}

module.exports = alarmService
