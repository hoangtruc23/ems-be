const tagDashboard = [
]
const tagOverview = [
    'current',
    'voltage',
    'load',
    'powerFactor'
]

const tagTrendPowerAnalysis = [
    'load', //load
    'q',
    's',
    'powerFactor',
    'voltage', // Volts
    'current'
]

const tagMeterSummary = [
    'load',
    'current',
    'voltage',
    'powerFactor',
]

const tagDashboardSummary = [
    'consumption',
    'demand',
    'load',
    'powerFactor',
    'activeMeters'
]

const tagDashboardRealtimeDataMonitoring = [
    'voltage',
    'current',
    'load'
]

const trendSummary = [
    'load',
    'current', 
    'voltage',
    'powerFactor',
    'frequency'
]

module.exports = {
    tagDashboard,
    tagOverview,
    tagTrendPowerAnalysis,
    tagMeterSummary,
    trendSummary,
    tagDashboardSummary,
    tagDashboardRealtimeDataMonitoring
}
