const { Mongoose } = require('mongoose');
const AlarmModel = require('../models/alarm');
const moment = require('moment-timezone');


const alarmService = {
    getAll: async (query) => {
        // const { startTime, endTime } = query
        const total = await AlarmModel.find({}).sort({ time: -1 })

        let active = 0
        let acknowledged = 0
        let critical = 0
        const unResolvedAlarms = []

        total.forEach(alarm => {
            if (alarm.status === 'unResolved') {
                unResolvedAlarms.push(alarm)
                active++
            } else if (alarm.status === 'resolved') {
                acknowledged++
            }

            if (alarm.severity?.toLowerCase() === 'critical') {
                critical++
            }
        })

        return {
            total: total.length,
            active: active,
            acknowledged: acknowledged,
            critical: critical,
            unResolvedAlarms: unResolvedAlarms
        }
    },
    summary: async () => {
        const result = await AlarmModel.aggregate([
                {
                    $group: {
                        _id: null,
                        critical: {
                            $sum: {
                                $cond: [{ $in: ['$severity', [2, '2']] }, 1, 0]
                            }
                        },
                        warning: {
                            $sum: {
                                $cond: [{ $in: ['$severity', [1, '1']] }, 1, 0]
                            }
                        },
                        info: {
                            $sum: {
                                $cond: [{ $in: ['$severity', [0, '0']] }, 1, 0]
                            }
                        },
                        resolved: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            const stats = result[0] || {
                critical: 0,
                warning: 0,
                info: 0,
                resolved: 0
            };

            return {
                critical: stats.critical,
                warning: stats.warning,
                info: stats.info,
                resolved: stats.resolved
            };
    },
    create: async (alarm) => {
        const defaultTime = moment().tz('Asia/Ho_Chi_Minh').format('DD-MM-YY HH:mm:ss');

        const newAlarm = new AlarmModel({
            name: alarm.name,
            title: alarm.title,
            severity: alarm.severity,
            note: alarm.note,
            value: alarm.value,
            deviceName: alarm.deviceName,
            time: alarm.time || defaultTime,
            status: 'unResolved'  
        })

        const savedAlarm = await newAlarm.save();
        return savedAlarm
    },
    update: async (alarmId, status) => {
        const newStatus = status
        if (alarmId === 'all') {
            await AlarmModel.updateMany(
                {},
                {
                    status: newStatus,
                },
            )
        } else {
            await AlarmModel.findByIdAndUpdate(alarmId, {
                status: newStatus,
            })
        }
        return null
    },
    resolve: async (alarmId) => {
        if (alarmId === 'all') {
            await AlarmModel.updateMany(
                {},
                {
                    status: "resolved",
                },
            )
        } else {
            await AlarmModel.findByIdAndUpdate(alarmId, {
                status: "resolved",
            })
        }
        return null
    }
}

module.exports = alarmService
