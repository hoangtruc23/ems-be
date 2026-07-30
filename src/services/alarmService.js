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
    create: async (alarm) => {
        const defaultTime = moment().tz('Asia/Ho_Chi_Minh').toDate();

        const newAlarm = new AlarmModel({
            name: alarm.name,
            title: alarm.title,
            severity: alarm.severity,
            note: alarm.note,
            value: alarm.value,
            deviceName: alarm.deviceName,
            time: alarm.time || defaultTime,
            status: 'unResolved',
            resolvedAt: null,
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
                    resolvedAt: newStatus === 'resolved' ? new Date() : null,
                },
            )
        } else {
            await AlarmModel.findByIdAndUpdate(alarmId, {
                status: newStatus,
                resolvedAt: newStatus === 'resolved' ? new Date() : null,
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
                    resolvedAt: new Date(),
                },
            )
        } else {
            await AlarmModel.findByIdAndUpdate(alarmId, {
                status: "resolved",
                resolvedAt: new Date(),
            })
        }
        return null
    }
}

module.exports = alarmService
