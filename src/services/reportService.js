const ControlHistoryModel = require('../models/controlHistory')
const TagnameModel = require('../models/tagname')
const ValueModel = require('../models/value')
const ReportConfigModel = require('../models/reportConfig')
const AlarmModel = require('../models/alarm')
const DeviceModel = require('../models/device')
const moment = require('moment-timezone')
const { tagTableChart } = require('../utils/constant/tagTableChart')

const ENERGY_EMISSION_FACTOR = 0.6592
const REPORT_TIMEZONE = 'Asia/Ho_Chi_Minh'

const normalizeNumber = (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
}

const shouldFilterByDevice = (deviceId) => {
    if (!deviceId) return false
    const normalized = String(deviceId).trim().toLowerCase()
    return normalized !== 'all'
}

const getRangeByFilter = (date, timeFilter) => {
    const base = moment.tz(date, REPORT_TIMEZONE)
    switch ((timeFilter || 'daily').toLowerCase()) {
        case 'weekly':
            return {
                start: base.clone().startOf('isoWeek').toDate(),
                end: base.clone().endOf('isoWeek').toDate(),
            }
        case 'monthly':
            return {
                start: base.clone().startOf('month').toDate(),
                end: base.clone().endOf('month').toDate(),
            }
        case 'yearly':
            return {
                start: base.clone().startOf('year').toDate(),
                end: base.clone().endOf('year').toDate(),
            }
        case 'daily':
        default:
            return {
                start: base.clone().startOf('day').toDate(),
                end: base.clone().endOf('day').toDate(),
            }
    }
}

const getBucketKey = (ts, timeFilter) => {
    const m = moment.tz(ts, REPORT_TIMEZONE)
    switch (timeFilter) {
        case 'weekly':
        case 'monthly':
            return m.startOf('day').valueOf()
        case 'yearly':
            return m.startOf('month').valueOf()
        case 'daily':
        default:
            return m.startOf('hour').valueOf()
    }
}

const getBucketLabel = (ts, timeFilter) => {
    const m = moment.tz(ts, REPORT_TIMEZONE)
    switch (timeFilter) {
        case 'weekly':
            return m.format('dd')
        case 'monthly':
            return m.format('D')
        case 'yearly':
            return m.format('MMM')
        case 'daily':
        default:
            return m.format('HH:00')
    }
}

const getValueByTag = (rows, tagName) =>
    rows
        .filter((row) => row.tagName === tagName)
        .sort((a, b) => a.ts - b.ts)

const calcEnergyFromSeries = (series) => {
    const sortedSeries = [...series]
        .filter((item) => item && item.value !== null && item.value !== undefined)
        .sort((a, b) => a.ts - b.ts)

    if (!sortedSeries.length) return 0
    if (sortedSeries.length === 1) {
        return sortedSeries[0].value || 0
    }

    const first = sortedSeries[0]
    const last = sortedSeries[sortedSeries.length - 1]
    if (!first || !last) return 0

    return Math.max(0, (last.value || 0) - (first.value || 0))
}


const reportService = {
    getDailyMetersTable: async (query) => {
        const { date, deviceId } = query

        if (!date) {
            throw new Error('date is required')
        }

        const config = await ReportConfigModel.findOne({ isActive: true }).lean()
        const start = moment.tz(date, REPORT_TIMEZONE).startOf('day').toDate()
        const end = moment(start).add(1, 'day').toDate()

        const matchStage = {
            date: { $gte: start, $lt: end },
        }
        if (shouldFilterByDevice(deviceId)) {
            matchStage.deviceId = deviceId
        }

        const tags = await TagnameModel.find({
            name: { $in: ['gridTotal', 'demandPower', 'gridPowerFactor'] },
        })
            .select({ _id: 1, name: 1, symbol: 1, unit: 1 })
            .lean()

        const tagNameById = new Map(
            tags.map((tag) => [tag._id.toString(), tag.name]),
        )

        const devices = await DeviceModel.find(
            shouldFilterByDevice(deviceId) ? { _id: deviceId } : {},
        )
            .select({ _id: 1, deviceName: 1, location: 1, isEnable: 1 })
            .lean()

        const deviceMap = new Map(
            devices.map((device) => [device._id.toString(), device]),
        )

        const docs = await ValueModel.find(matchStage)
            .select({ deviceId: 1, values: 1, date: 1 })
            .lean()

        const resultMap = new Map()

        // NOTE: doc.values là MẢNG snapshot: [{ ts, value: [{ tagId, value }, ...] }, ...]
        docs.forEach((doc) => {
            const devId = doc.deviceId.toString()
            if (!resultMap.has(devId)) {
                const device = deviceMap.get(devId)
                resultMap.set(devId, {
                    meterName: device?.deviceName || devId,
                    area: device?.location || null,
                    energySeries: [],
                    peakSeries: [],
                    pfSeries: [],
                    status: device?.isEnable ? 'online' : 'offline',
                })
            }

            const bucket = resultMap.get(devId)
            const snapshots = Array.isArray(doc.values) ? doc.values : []

            snapshots.forEach((snapshot) => {
                const ts = Number(snapshot.ts) || new Date(doc.date || Date.now()).getTime()
                if (!Number.isFinite(ts)) return

                const items = Array.isArray(snapshot.value) ? snapshot.value : []
                items.forEach((item) => {
                    const tagName = tagNameById.get(item.tagId?.toString())
                    const value = normalizeNumber(item.value)
                    if (!tagName || value === null) return

                    if (tagName === 'gridTotal') {
                        bucket.energySeries.push({ ts, value })
                    }
                    if (tagName === 'demandPower') {
                        bucket.peakSeries.push({ ts, value })
                    }
                    if (tagName === 'gridPowerFactor') {
                        bucket.pfSeries.push({ ts, value })
                    }
                })
            })
        })

        return Array.from(resultMap.values()).map((item) => {
            const energy = item.energySeries.length >= 2
                ? Math.max(
                      0,
                      item.energySeries[item.energySeries.length - 1].value -
                          item.energySeries[0].value,
                  )
                : 0

            const peak = item.peakSeries.length
                ? Math.max(...item.peakSeries.map((x) => x.value))
                : 0

            const avgPf = item.pfSeries.length
                ? item.pfSeries.reduce((sum, x) => sum + x.value, 0) /
                  item.pfSeries.length
                : 0

            const tariff = normalizeNumber(config?.tariff) || 0

            return {
                meterName: item.meterName,
                area: item.area,
                energy,
                cost: energy * tariff,
                peak,
                avgPf,
                status: item.status,
            }
        })
    },

    getDailyAlarms: async (query) => {
        const { date, deviceId } = query

        if (!date) {
            throw new Error('date is required')
        }

        const start = moment.tz(date, REPORT_TIMEZONE).startOf('day').toDate()
        const end = moment(start).add(1, 'day').toDate()

        let allowedDeviceNames = null
        if (shouldFilterByDevice(deviceId)) {
            const devices = await DeviceModel.find({ _id: deviceId })
                .select({ _id: 1, deviceName: 1 })
                .lean()
            allowedDeviceNames = new Set(devices.map((device) => device.deviceName))
        }

        const alarms = await AlarmModel.find({
            time: { $gte: start, $lt: end },
        })
            .sort({ time: 1 })
            .lean()
            .then((rows) =>
                allowedDeviceNames
                    ? rows.filter((alarm) => allowedDeviceNames.has(alarm.deviceName))
                    : rows,
            )

        return alarms.map((alarm) => {
            const startTime = new Date(alarm.time).getTime()
            const endTime = alarm.resolvedAt ? new Date(alarm.resolvedAt).getTime() : null
            const duration =
                startTime && endTime && endTime >= startTime
                    ? Math.round((endTime - startTime) / 60000)
                    : null

            return {
                time: alarm.time,
                meter: alarm.deviceName,
                event: alarm.title || alarm.note || alarm.name,
                severity: alarm.severity,
                duration,
                status: alarm.status,
            }
        })
    },

    getDailyEnergyCharts: async (query) => {
        const { date, deviceId } = query

        if (!date) {
            throw new Error('date is required')
        }

        const start = moment
            .tz(date, REPORT_TIMEZONE)
            .startOf('day')
            .toDate()
        const end = moment(start).add(1, 'day').toDate()

        const tagDocs = await TagnameModel.find({
            name: { $in: ['gridTotal', 'demandPower'] },
        })
            .select({ _id: 1, name: 1, symbol: 1, unit: 1 })
            .lean()

        const tagNameById = new Map(
            tagDocs.map((tag) => [tag._id.toString(), tag.name]),
        )

        const matchStage = {
            date: { $gte: start, $lt: end },
        }
        if (shouldFilterByDevice(deviceId)) {
            matchStage.deviceId = deviceId
        }

        const docs = await ValueModel.find(matchStage)
            .select({ deviceId: 1, values: 1, date: 1 })
            .lean()

        const hourlyMap = new Map()

        for (let hour = 0; hour < 24; hour++) {
            const hourTs = moment(start).add(hour, 'hour').valueOf()
            hourlyMap.set(hourTs, {
                x: hourTs,
                label: moment(hourTs).format('HH:00'),
                energy: 0,
                load: 0,
                isPeak: false,
            })
        }

        // NOTE: doc.values là MẢNG snapshot: [{ ts, value: [{ tagId, value }, ...] }, ...]
        // QUAN TRỌNG: gridTotal là chỉ số CỘNG DỒN (như công tơ điện, chỉ tăng dần theo
        // thời gian) — KHÔNG được cộng thẳng các lần đọc lại với nhau. Điện năng tiêu thụ
        // trong 1 khung giờ phải là HIỆU SỐ giữa lần đọc gridTotal cuối cùng của giờ đó và
        // lần đọc cuối cùng của giờ liền trước (carry-forward khi giờ đó không có lần đọc
        // mới nào). demandPower là giá trị tức thời (instantaneous) nên vẫn dùng Math.max
        // theo giờ như cũ.
        const gridTotalReadings = [] // { ts, value }

        docs.forEach((doc) => {
            const snapshots = Array.isArray(doc.values) ? doc.values : []

            snapshots.forEach((snapshot) => {
                const snapshotTs = Number(snapshot.ts)
                if (!Number.isFinite(snapshotTs)) return

                const hourTs = moment
                    .tz(snapshotTs, REPORT_TIMEZONE)
                    .startOf('hour')
                    .valueOf()

                const bucket = hourlyMap.get(hourTs)
                if (!bucket) return

                const items = Array.isArray(snapshot.value) ? snapshot.value : []
                let loadHourValue = null

                items.forEach((item) => {
                    const tagName = tagNameById.get(item.tagId?.toString())
                    if (!tagName) return

                    const value = normalizeNumber(item.value)
                    if (value === null) return

                    if (tagName === 'gridTotal') {
                        gridTotalReadings.push({ ts: snapshotTs, value })
                    }

                    if (tagName === 'demandPower') {
                        loadHourValue = loadHourValue === null ? value : Math.max(loadHourValue, value)
                    }
                })

                if (loadHourValue !== null) {
                    bucket.load = Math.max(bucket.load, loadHourValue)
                }
            })
        })

        // Tính điện năng tiêu thụ mỗi giờ dựa trên hiệu số chỉ số cộng dồn gridTotal
        gridTotalReadings.sort((a, b) => a.ts - b.ts)

        const hourTimestamps = Array.from(hourlyMap.keys()).sort((a, b) => a - b)
        let readingIndex = 0
        let lastKnownValue = null
        let prevHourEndValue = null // chỉ số gridTotal tại cuối giờ liền trước (baseline)

        hourTimestamps.forEach((hourTs) => {
            const hourEndTs = hourTs + 60 * 60 * 1000

            // Đưa readingIndex tới lần đọc cuối cùng còn nằm trong giờ này
            while (
                readingIndex < gridTotalReadings.length &&
                gridTotalReadings[readingIndex].ts < hourEndTs
            ) {
                lastKnownValue = gridTotalReadings[readingIndex].value
                readingIndex++
            }

            const bucket = hourlyMap.get(hourTs)
            if (lastKnownValue !== null && prevHourEndValue !== null) {
                bucket.energy = Math.max(0, lastKnownValue - prevHourEndValue)
            } else {
                bucket.energy = 0 // chưa đủ 2 điểm đọc để tính hiệu số
            }

            if (lastKnownValue !== null) {
                prevHourEndValue = lastKnownValue
            }
        })

        const chart = Array.from(hourlyMap.values())
        let peakPoint = null

        chart.forEach((item) => {
            if (!peakPoint || item.load > peakPoint.load) {
                peakPoint = item
            }
        })

        if (peakPoint) {
            peakPoint.isPeak = true
        }

        return {
            energyChart: chart.map((item) => ({
                x: item.x,
                label: item.label,
                y: item.energy,
            })),
            loadChart: chart.map((item) => ({
                x: item.x,
                label: item.label,
                y: item.load,
                isPeak: item.isPeak,
            })),
            peakPoint,
            tags: tagDocs,
        }
    },

    getEnergyReport: async (query) => {
        const { date, deviceId, timeFilter = 'Daily' } = query

        const normalizedFilter = String(timeFilter).toLowerCase()
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(normalizedFilter)) {
            throw new Error('timeFilter must be Daily, Weekly, Monthly, or Yearly')
        }

        const config = await ReportConfigModel.findOne({ isActive: true }).lean()
        if (!config) {
            throw new Error('reportConfig is missing')
        }
        console.log('[REPORT ENERGY] config values', {
            tariff: config.tariff,
            savingEnergy: config.savingEnergy,
            threshold: config.threshold,
            emissionFactor: config.emissionFactor,
            energyTagName: config.energyTagName,
            demandTagName: config.demandTagName,
            pfTagName: config.pfTagName,
        })

        const { start, end } = getRangeByFilter(date, normalizedFilter)
        const tagNames = [
            config.energyTagName,
            config.demandTagName,
            config.pfTagName,
        ]

        const tags = await TagnameModel.find({ name: { $in: tagNames } })
            .select({ _id: 1, name: 1, symbol: 1, unit: 1 })
            .lean()

        const tagNameSet = new Set(tags.map((tag) => tag.name))
        if (!tagNameSet.has(config.energyTagName) || !tagNameSet.has(config.demandTagName) || !tagNameSet.has(config.pfTagName)) {
            throw new Error('Some report tags are missing in tagnames collection')
        }

        const categoryByTagName = new Map([
            [config.energyTagName, 'energy'],
            [config.demandTagName, 'demand'],
            [config.pfTagName, 'pf'],
        ])
        const tagNameById = new Map(
            tags.map((tag) => [tag._id.toString(), tag.name]),
        )

        const matchStage = {
            date: { $gte: start, $lte: end },
        }
        if (shouldFilterByDevice(deviceId)) matchStage.deviceId = deviceId

        const docs = await ValueModel.find(matchStage)
            .select({ deviceId: 1, values: 1, date: 1 })
            .lean()
        console.log('[REPORT ENERGY] docs loaded', docs.length)

        // QUAN TRỌNG: deviceMap và chartMap phải được khai báo TRƯỚC khi dùng
        // ở bất kỳ đoạn code nào bên dưới (kể cả đoạn debug), nếu không sẽ bị
        // lỗi ReferenceError: Cannot access 'deviceMap' before initialization
        // do temporal dead zone của const/let.
        const deviceMap = new Map()
        const chartMap = new Map()

        // NOTE: doc.values là MẢNG snapshot: [{ ts, value: [{ tagId, value }, ...] }, ...]

        // --- Đoạn debug: đếm số item hợp lệ tìm thấy ---
        let validItemCount = 0
        docs.forEach((doc) => {
            const snapshots = Array.isArray(doc.values) ? doc.values : []
            snapshots.forEach((snapshot) => {
                const items = Array.isArray(snapshot.value) ? snapshot.value : []
                items.forEach((item) => {
                    const tagName = tagNameById.get(item.tagId?.toString())
                    if (tagName && item.value !== null && item.value !== undefined) {
                        validItemCount++
                        if (validItemCount <= 5) {
                            console.log(`[DEBUG - TÌM THẤY DATA] Tag: ${tagName} | Value: ${item.value} | Ts: ${snapshot.ts}`)
                        }
                    }
                })
            })
        })
        console.log(`[DEBUG - TỔNG HỢP] Số lượng item hợp lệ (khác null) tìm thấy: ${validItemCount}`)

        // --- Đoạn build deviceMap / chartMap ---
        docs.forEach((doc) => {
            const deviceKey = doc.deviceId.toString()
            if (!deviceMap.has(deviceKey)) {
                deviceMap.set(deviceKey, {
                    [config.energyTagName]: [],
                    [config.demandTagName]: [],
                    [config.pfTagName]: [],
                })
            }
            const bucket = deviceMap.get(deviceKey)
            const snapshots = Array.isArray(doc.values) ? doc.values : []

            snapshots.forEach((snapshot) => {
                const timestamp = Number(snapshot.ts) || new Date(doc.date || Date.now()).getTime()
                const bucketKey = getBucketKey(timestamp, normalizedFilter)
                if (!chartMap.has(bucketKey)) {
                    chartMap.set(bucketKey, {
                        energy: [],
                        demand: [],
                        pf: [],
                    })
                }

                const chartBucket = chartMap.get(bucketKey)
                const items = Array.isArray(snapshot.value) ? snapshot.value : []

                items.forEach((item) => {
                    const tagName = tagNameById.get(item.tagId?.toString())
                    if (!tagName) return
                    const value = normalizeNumber(item.value)
                    if (value === null) return

                    const seriesItem = { ts: timestamp, value }
                    bucket[tagName].push(seriesItem)

                    const category = categoryByTagName.get(tagName)
                    if (category) {
                        chartBucket[category].push(seriesItem)
                    }
                })
            })
        })

        const perDeviceEnergy = []
        const perDeviceDemand = []
        const perDevicePf = []

        deviceMap.forEach((bucket) => {
            const energySeries = bucket[config.energyTagName] || []
            const demandSeries = bucket[config.demandTagName] || []
            const pfSeries = bucket[config.pfTagName] || []

            console.log('[REPORT ENERGY] series sample', {
                energyLen: energySeries.length,
                demandLen: demandSeries.length,
                pfLen: pfSeries.length,
                energySample: energySeries.slice(0, 3),
                demandSample: demandSeries.slice(0, 3),
                pfSample: pfSeries.slice(0, 3),
            })

            perDeviceEnergy.push(calcEnergyFromSeries(energySeries))

            const demandValues = demandSeries
                .map((item) => item.value)
                .filter((value) => value !== null)
            perDeviceDemand.push(demandValues.length ? Math.max(...demandValues) : 0)

            const pfValues = pfSeries
                .map((item) => item.value)
                .filter((value) => value !== null)
            perDevicePf.push(pfValues.length ? pfValues.reduce((sum, value) => sum + value, 0) / pfValues.length : 0)
        })

        const totalEnergy = perDeviceEnergy.reduce((sum, value) => sum + value, 0)
        const peakDemand = perDeviceDemand.length ? Math.max(...perDeviceDemand) : 0
        const averagePf = perDevicePf.length
            ? perDevicePf.reduce((sum, value) => sum + value, 0) / perDevicePf.length
            : 0
        const totalCost = totalEnergy * (normalizeNumber(config.tariff) || 0)
        const co2Emission = totalEnergy * (normalizeNumber(config.emissionFactor) || ENERGY_EMISSION_FACTOR)
        const savingOpportunity = (normalizeNumber(config.savingEnergy) || 0) * (normalizeNumber(config.tariff) || 0)

        console.log('[REPORT ENERGY] KPI debug', {
            perDeviceEnergy,
            perDeviceDemand,
            perDevicePf,
            totalEnergy,
            peakDemand,
            averagePf,
            totalCost,
            co2Emission,
            savingOpportunity,
        })

        return {
            kpis: {
                totalEnergy,
                totalCost,
                peakDemand,
                averagePf,
                co2Emission,
                savingOpportunity,
            },

            meta: {
                date,
                timeFilter: normalizedFilter,
                start,
                end,
                deviceId: deviceId || null,
                config,
                tags,
            },
        }
    },

    getChartDashboard: async (query) => {
        const { dateTime } = query
        if (!dateTime) throw new Error('dateTime is required')

        const start = moment
            .tz(dateTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment(start).add(1, 'day').toDate()

        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsArray: { $objectToArray: '$values' } } },
            { $unwind: '$tagsArray' },
            { $addFields: { tagId: { $toObjectId: '$tagsArray.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },
            {
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsArray.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    metrics: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    minute: '$_id',
                    bessCharging: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: [
                                                '$$item.k',
                                                [
                                                    'pcs1ChargePower',
                                                    'pcs2ChargePower',
                                                ],
                                            ],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                    bessDischarging: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: [
                                                '$$item.k',
                                                [
                                                    'pcs1DischargePower',
                                                    'pcs2DischargePower',
                                                ],
                                            ],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                    gridImport: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$metrics',
                                        as: 'item',
                                        cond: {
                                            $in: ['$$item.k', ['importPower']],
                                        },
                                    },
                                },
                                as: 'p',
                                in: '$$p.v',
                            },
                        },
                    },
                },
            },
        ]

        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    bessCharging: null,
                    bessDischarging: null,
                    gridImport: null,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => [
                    moment(item.minute).valueOf(),
                    {
                        bessCharging: item.bessCharging,
                        bessDischarging: item.bessDischarging,
                        gridImport: item.gridImport,
                    },
                ]),
            )

            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, values)
                }
            }

            // Chuyển map thành mảng định dạng cuối
            const finalData = {
                bessCharging: [],
                bessDischarging: [],
                gridImport: [],
            }

            allMinutes.forEach((values, timestamp) => {
                finalData.bessCharging.push({
                    x: timestamp,
                    y: values.bessCharging,
                })
                finalData.bessDischarging.push({
                    x: timestamp,
                    y: values.bessDischarging,
                })
                finalData.gridImport.push({
                    x: timestamp,
                    y: values.gridImport,
                })
            })

            return [
                { name: 'BESS charging', data: finalData.bessCharging },
                { name: 'BESS discharging', data: finalData.bessDischarging },
                { name: 'Grid import', data: finalData.gridImport },
            ]
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    chartMonitoring: async (query) => {
        const { dateTime } = query

        const start = moment
            .tz(dateTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment(start).add(1, 'day').toDate()
        const tagnames = [
            'pcs1BmsSoc',
            'pcs1ChargePower',
            'pcs1DischargePower',
            'pcs2BmsSoc',
            'pcs2ChargePower',
            'pcs2DischargePower',
        ]
        const tags = await TagnameModel.find({ name: { $in: tagnames } })
            .select({ _id: 1, symbol: 1, name: 1 })
            .lean()
        const idsStr = tags.map((item) => item._id.toString())
        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsValue: { $objectToArray: '$values' } } },
            {
                $addFields: {
                    tagsValue: {
                        $filter: {
                            input: '$tagsValue',
                            as: 'tag',
                            cond: { $in: ['$$tag.k', idsStr] },
                        },
                    },
                },
            },
            {
                $project: {
                    minute: 1,
                    tagsValue: 1,
                },
            },
            { $unwind: '$tagsValue' },
            { $addFields: { tagId: { $toObjectId: '$tagsValue.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },
            {
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsValue.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    data: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            { $addFields: { dataObj: { $arrayToObject: '$data' } } },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ minute: '$_id' }, '$dataObj'],
                    },
                },
            },
        ]
        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const defaultValues = tagnames.reduce((acc, tagname) => {
                acc[tagname] = null
                return acc
            }, {})

            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    ...defaultValues,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => {
                    const result = {}
                    tagnames.forEach((tagname) => {
                        result[tagname] = item[tagname]
                    })
                    return [moment(item.minute).valueOf(), result]
                }),
            )
            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, {
                        ...allMinutes.get(timestamp),
                        ...values,
                    })
                }
            }

            const finalData = tagnames.reduce((acc, tagname) => {
                acc[tagname] = []
                return acc
            }, {})

            allMinutes.forEach((values, timestamp) => {
                tagnames.forEach((tagname) => {
                    finalData[tagname].push({
                        x: timestamp,
                        y: values[tagname],
                    })
                })
            })
            const result = tags.map((tag) => ({
                name: tag.symbol,
                data: finalData[tag.name],
            }))

            return result
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    getDataControlChart: async (query) => {
        try {
            const { startTime, endTime, timePeriod } = query

            if (!startTime || !endTime) {
                throw new BadReq(errorCode.ENTER_STARTTIME_ENDTIME)
            }

            const start = moment
                .tz(startTime, 'Asia/Ho_Chi_Minh')
                .startOf('day')
                .toDate()

            const end = moment
                .tz(endTime, 'Asia/Ho_Chi_Minh')
                .endOf('day')
                .toDate()

            if (isNaN(start) || isNaN(end)) {
                throw new Error('Invalid date input')
            }

            let timePeriodExpr
            switch ((timePeriod || 'daily').toLowerCase()) {
                case 'weekly':
                    timePeriodExpr = {
                        $dateToString: {
                            format: '%G-W%V',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
                case 'monthly':
                    timePeriodExpr = {
                        $dateToString: {
                            format: '%m-%Y',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
                case 'daily':
                    timePeriodExpr = {
                        $dateToString: {
                            // format: '%d-%m-%Y',
                            format: '%Y-%m-%d',
                            date: '$startTime',
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    }
                    break
            }

            const pipeLine = [
                {
                    $match: {
                        startTime: {
                            $gte: start,
                            $lte: end,
                        },
                        action: { $in: ['charge', 'discharge'] },
                    },
                },
                {
                    $addFields: {
                        timePeriod: timePeriodExpr,
                    },
                },
                {
                    $sort: { startTime: 1 }, //tăng dần (cũ nhất -> mới nhất)
                },
                {
                    $group: {
                        _id: {
                            action: '$action',
                            timePeriod: '$timePeriod',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $group: {
                        _id: '$_id.action',
                        data: {
                            $push: {
                                x: '$_id.timePeriod',
                                y: '$count',
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        data: {
                            $sortArray: {
                                input: '$data', // Sắp xếp mảng data
                                sortBy: { x: 1 }, // Sắp xếp thời gian
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        action: '$_id',
                        data: 1,
                    },
                },
            ]

            const data = await ControlHistoryModel.aggregate(pipeLine)

            return data
        } catch (error) {
            throw error
        }
    },

    controlTable: async (query) => {
        const { startTime, endTime } = query
        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()
        const end = moment.tz(endTime, 'Asia/Ho_Chi_Minh').endOf('day').toDate()

        const pineLine = [
            { $match: { startTime: { $gte: start, $lt: end } } },
            {
                $project: {
                    __v: 0,
                },
            },
        ]
        const tagnameInfo = await ControlHistoryModel.aggregate(pineLine)
        return tagnameInfo
    },

    generateChart: async (query) => {
        const { dateTime, startTime, endTime } = query

        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment
            .tz(endTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        // const end = moment(start).add(1, 'day').toDate()
        const tagnames = tagTableChart
        const tags = await TagnameModel.find({ name: { $in: tagnames } })
            .select({ _id: 1, symbol: 1, name: 1 })
            .lean()
        const idsStr = tags.map((item) => item._id.toString())
        const pipeline = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    minute: {
                        $dateTrunc: {
                            date: '$createdAt',
                            unit: 'minute',
                            binSize: 1,
                            timezone: 'Asia/Ho_Chi_Minh',
                        },
                    },
                    values: '$values',
                },
            },
            { $addFields: { tagsValue: { $objectToArray: '$values' } } },
            {
                $addFields: {
                    tagsValue: {
                        $filter: {
                            input: '$tagsValue',
                            as: 'tag',
                            cond: { $in: ['$$tag.k', idsStr] },
                        },
                    },
                },
            },
            {
                $project: {
                    minute: 1,
                    tagsValue: 1,
                },
            },
            { $unwind: '$tagsValue' },
            { $addFields: { tagId: { $toObjectId: '$tagsValue.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },
            {
                $group: {
                    _id: {
                        minute: '$minute',
                        tag: '$tagInfo.name',
                    },
                    value: { $sum: '$tagsValue.v' },
                },
            },
            {
                $group: {
                    _id: '$_id.minute',
                    data: {
                        $push: {
                            k: '$_id.tag',
                            v: '$value',
                        },
                    },
                },
            },
            { $addFields: { dataObj: { $arrayToObject: '$data' } } },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [{ minute: '$_id' }, '$dataObj'],
                    },
                },
            },
        ]
        const aggregationResult = await ValueModel.aggregate(pipeline)

        const fillMissingData = (aggregationResult, start, end) => {
            const defaultValues = tagnames.reduce((acc, tagname) => {
                acc[tagname] = null
                return acc
            }, {})

            const allMinutes = new Map()
            let currentMinute = moment(start)

            while (currentMinute.isBefore(end)) {
                const timestamp = currentMinute.valueOf()
                allMinutes.set(timestamp, {
                    ...defaultValues,
                })
                currentMinute.add(1, 'minute')
            }

            // Map kết quả aggregation sang map
            const aggMap = new Map(
                aggregationResult.map((item) => {
                    const result = {}
                    tagnames.forEach((tagname) => {
                        result[tagname] = item[tagname]
                    })
                    return [moment(item.minute).valueOf(), result]
                }),
            )
            // Kết hợp hai map
            for (const [timestamp, values] of aggMap.entries()) {
                if (allMinutes.has(timestamp)) {
                    allMinutes.set(timestamp, {
                        ...allMinutes.get(timestamp),
                        ...values,
                    })
                }
            }

            const finalData = tagnames.reduce((acc, tagname) => {
                acc[tagname] = []
                return acc
            }, {})

            allMinutes.forEach((values, timestamp) => {
                tagnames.forEach((tagname) => {
                    finalData[tagname].push({
                        x: timestamp,
                        y: values[tagname],
                    })
                })
            })
            const result = tags.map((tag) => ({
                name: tag.symbol,
                data: finalData[tag.name],
            }))

            return result
        }

        const filledData = fillMissingData(aggregationResult, start, end)
        return filledData
    },

    generateTableReport: async (query) => {
        const { startTime, endTime } = query
        const tagnames = tagTableChart
        const tagInfo = await TagnameModel.find({ name: { $in: tagnames } })
            .select('_id')
            .lean()
        const tagIds = tagInfo.map((t) => t._id.toString())

        const start = moment
            .tz(startTime, 'Asia/Ho_Chi_Minh')
            .startOf('day')
            .toDate()

        const end = moment.tz(endTime, 'Asia/Ho_Chi_Minh').endOf('day').toDate()

        const pineLine = [
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $project: {
                    _id: 0,
                    createdAt: 1,
                    tagValuesArray: { $objectToArray: '$values' },
                },
            },
            { $unwind: '$tagValuesArray' },
            {
                $match: {
                    'tagValuesArray.k': { $in: tagIds },
                },
            },
            { $addFields: { tagId: { $toObjectId: '$tagValuesArray.k' } } },
            {
                $lookup: {
                    from: 'tagnames',
                    localField: 'tagId',
                    foreignField: '_id',
                    as: 'tagInfo',
                },
            },
            { $unwind: '$tagInfo' },

            // 7. Group lại theo thời gian để tạo các cột báo cáo
            {
                $group: {
                    _id: {
                        time: {
                            $dateToString: {
                                format: '%Y-%m-%d %H:%M:%S',
                                date: '$createdAt',
                                timezone: 'Asia/Ho_Chi_Minh',
                            },
                        },
                    },
                    data: {
                        $push: {
                            k: '$tagInfo.name',
                            v: '$tagValuesArray.v',
                        },
                    },
                },
            },
            {
                $sort: { '_id.time': -1 }, // 1 -> tăng dần , -1 -> giảm dần
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { time: '$_id.time' },
                            { $arrayToObject: '$data' },
                        ],
                    },
                },
            },
        ]

        const tagnameInfo = await ValueModel.aggregate(pineLine)
        return tagnameInfo
    },

    getChartVoltage: async () => {
    const TAG_NAME = ['gridVolt', 'gridFreq', 'gridPowerFactor']
    const start = moment.tz(new Date(), 'Asia/Ho_Chi_Minh').startOf('day').toDate()
    const end = moment(start).add(1, 'day').toDate()

    const tags = await TagnameModel.find({ name: { $in: TAG_NAME } })
        .select({ _id: 1, name: 1, symbol: 1 }).lean()
    const tagNameById = new Map(tags.map(t => [t._id.toString(), t.name]))

    const docs = await ValueModel.find({ date: { $gte: start, $lt: end } })
        .select({ values: 1 }).lean()

    const series = new Map(tags.map(t => [t.symbol, []]))
    docs.forEach(doc => {
        (doc.values || []).forEach(snap => {
            const ts = Number(snap.ts)
            if (!Number.isFinite(ts)) return
            ;(snap.value || []).forEach(item => {
                const name = tagNameById.get(item.tagId?.toString())
                if (!name) return
                const tag = tags.find(t => t.name === name)
                series.get(tag.symbol).push({ x: ts, y: item.value })
            })
        })
    })

    return Array.from(series.entries()).map(([name, data]) => ({ name, data }))
}
}

module.exports = reportService