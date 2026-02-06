const tagDashboard = [
    'importPowerSolar',
    'importPower',
    'gridPowerPh1',
    'gridPowerPh2',
    'gridPowerPh3',
    'gridFreq',
    'gensetStatus',
    'gensetRunTime',
    // 'pcs1DcInputPower',
    // 'pcs2DcInputPower',
    'pcs1OutputActivePower',
    'pcs2OutputActivePower',
    'pcs1OutputVoltagePhaseA',
    'pcs1WorkingMode',
    'pcs2WorkingMode',
]

// const tagOverviewGateWay = [
//     'totalBessRate1SumImport',
//     'totalBessRate1SumTodayImport',
//     'totalBessRate2SumImport',
//     'totalBessRate2SumTodayImport',
//     'totalBessRate3SumImport',
//     'totalBessRate3SumTodayImport'
// ]

const tagOverview = [
    // GateWay
    //Import
    'totalBessRate1SumImport',
    'totalBessRate1SumTodayImport',
    'totalBessRate2SumImport',
    'totalBessRate2SumTodayImport',
    'totalBessRate3SumImport',
    'totalBessRate3SumTodayImport',
    //Export
    'totalBessRate1SumExport',
    'totalBessRate1SumTodayExport',
    'totalBessRate2SumExport',
    'totalBessRate2SumTodayExport',
    'totalBessRate3SumExport',
    'totalBessRate3SumTodayExport',

    'pcs1BmsSoc', // 429
    'pcs1ChargePower', //423
    'pcs1DischargePower', //424
    'pcs1TotalCharge', //472
    'chargeLimit', //64
    'dischargeLimit', //65
    'pcs1TotalDischarge', //474
    'pcs1StateOfHealth', //430,
    'pcs2BmsSoc', //509
    'pcs2ChargePower', //503
    'pcs2DischargePower',
    'pcs2TotalCharge', //552
    'pcs2TotalDischarge', //554
    'pcs2StateOfHealth', //510

    'chargeCutOff', //385
    'dischargeCutOff', // 383
]

const tagSingleRack = [
    'singleRack1OfBRMU1Current',
    'singleRack1OfBRMU1Voltage',
    'singleRack1OfBRMU1SoC',
    'singleRack1OfBRMU1SoH',
    'singleRack1OfBRMU1HV',
    'singleRack1OfBRMU1Err',
    'singleRack2OfBRMU1Voltage',
    'singleRack2OfBRMU1Current',
    'singleRack2OfBRMU1SoC',
    'singleRack2OfBRMU1SoH',
    'singleRack2OfBRMU1HV',
    'singleRack2OfBRMU1Err',
    'singleRack3OfBRMU1Voltage',
    'singleRack3OfBRMU1Current',
    'singleRack3OfBRMU1HV',
    'singleRack3OfBRMU1Err',
    'singleRack3OfBRMU1SoC',
    'singleRack3OfBRMU1SoH',
    'singleRack4OfBRMU1Voltage',
    'singleRack4OfBRMU1Current',
    'singleRack4OfBRMU1HV',
    'singleRack4OfBRMU1Err',
    'singleRack4OfBRMU1SoC',
    'singleRack4OfBRMU1SoH',
    'singleRack5OfBRMU1Voltage',
    'singleRack5OfBRMU1Current',
    'singleRack5OfBRMU1HV',
    'singleRack5OfBRMU1Err',
    'singleRack5OfBRMU1SoC',
    'singleRack5OfBRMU1SoH',
    'singleRack1OfBRMU2Voltage',
    'singleRack1OfBRMU2Current',
    'singleRack1OfBRMU2HV',
    'singleRack1OfBRMU2Err',
    'singleRack1OfBRMU2SoC',
    'singleRack1OfBRMU2SoH',
    'singleRack2OfBRMU2Voltage',
    'singleRack2OfBRMU2Current',
    'singleRack2OfBRMU2HV',
    'singleRack2OfBRMU2Err',
    'singleRack2OfBRMU2SoC',
    'singleRack2OfBRMU2SoH',
    'singleRack3OfBRMU2Voltage',
    'singleRack3OfBRMU2Current',
    'singleRack3OfBRMU2HV',
    'singleRack3OfBRMU2Err',
    'singleRack3OfBRMU2SoC',
    'singleRack3OfBRMU2SoH',
    'singleRack4OfBRMU2Voltage',
    'singleRack4OfBRMU2Current',
    'singleRack4OfBRMU2HV',
    'singleRack4OfBRMU2Err',
    'singleRack4OfBRMU2SoC',
    'singleRack4OfBRMU2SoH',
    'singleRack5OfBRMU2Voltage',
    'singleRack5OfBRMU2Current',
    'singleRack5OfBRMU2HV',
    'singleRack5OfBRMU2Err',
    'singleRack5OfBRMU2SoC',
    'singleRack5OfBRMU2SoH',
]

const tagPCSAlarm = [
    'insulationFault',
    'leakageCurrentFault',
    'dcOverVol',
    'gridAmplitudeAbnormal',
    'gridPhaseSequenceAbnormal',
    'busOverVol',
    'gridFrequencyAbnormal',
    'igbtOverTemperature',
    'innerOverTemperature',
    'softStartFault',
    'commFault',
    'spdFault',
    'bmsSystemFault',
    'epoFault',
    'overloadPro',
    'bmsCommFault',
    'shortCircuitPro',
    'antiCounterCurrentCommFault',
    'parallelCommWireAbnormalPro',
    'remoteCommFault',
    'dcFuseDisconnected',
    'inverterOverCurrent',
    'entranceGuardAlarm',
    'batHeavyLoadLowVolPro',
    'dcSoftStartFault',
    'phaseLockingAbnormal',
    'batLowVolAlarm',
    'pcs1DcMainContactorFault',
    'antiCounterCurrentShutdown',
    'externalEpoFault',
    'fanFault',
    'radiatorOverTemperatureAlarm',
    'mainContactorFault',
    'inverterHardwareOverCurrent',
    'batVolChargingConditions',
    'inputSwitchDisconnected',
    'driveFault',
    'overloadAlarm',
    'hardwareFault',
    'modelSettingError',
    'externalContactorFault',
    'pcs1_2',
    'pcs1_3',
    'batOverVolPro',
    'batLightLoadLowVolPro',
    'dcOverCurrent',
    'outVolAbnormal',
    'outVolOffGridConditions',
    'overloadPro',
    'shortCircuitPro',
    'parallelCommWireAbnormalPro',
    'dcFuseDisconnected',
    'batHeavyLoadLowVolPro',
    'batLowVolAlarm',
    'externalEpoFault',
    'batVolChargingConditions',
    'overloadAlarm',
]

const tagPCSAlarm_2 = [
    'pcs2InsulationFault',
    'pcs2LeakageCurrentFault',
    'pcs2DcOverVol',
    'pcs2GridAmplitudeAbnormal',
    'pcs2GridPhaseSequenceAbnormal',
    'pcs2BusOverVol',
    'pcs2GridFrequencyAbnormal',
    'pcs2IgbtOverTemperature',
    'pcs2InverterOverCurrent',
    'pcs2DcSoftStartFault',
    'pcs2DcMainContactorFault',
    'pcs2FanFault',
    'pcs2MainContactorFault',
    'pcs2InputSwitchDisconnected',
    'pcs2HardwareFault',
    'pcs2InnerOverTemperature',
    'pcs2SoftStartFault',
    'pcs2CommFault',
    'pcs2SpdFault',
    'pcs2EpoFault',
    'pcs2BmsSystemFault',
    'pcs2BmsCommFault',
    'pcs2AntiCounterCurrentCommFault',
    'pcs2RemoteCommFault',
    'pcs2EntranceGuardAlarm',
    'pcs2PhaseLockingAbnormal',
    'pcs2AntiCounterCurrentShutdown',
    'pcs2RadiatorOverTemperatureAlarm',
    'pcs2InverterHardwareOverCurrent',
    'pcs2DriveFault',
    'pcs2ModelSettingError',
    'pcs2BatOverVolPro',
    'pcs2BatLightLoadLowVolPro',
    'pcs2DcOverCurrent',
    'pcs2OutVolAbnormal',
    'pcs2OutVolOffGridConditions',
    'pcs2OverloadPro',
    'pcs2ShortCircuitPro',
    'pcs2ParallelCommWireAbnormalPro',
    'pcs2DcFuseDisconnected',
    'pcs2BatHeavyLoadLowVolPro',
    'pcs2BatLowVolAlarm',
    'pcs2ExternalEpoFault',
    'pcs2BatVolChargingConditions',
    'pcs2OverloadAlarm',
    'pcs2ExternalContactorFault',
]

const batteryGroup = [
    //BMS Monitoring
    'pcs1BmsSoc', //429
    'pcs1StateOfHealth', //430
    'pcs2BmsSoc', //509
    'pcs2StateOfHealth', //510
    'pcs1Humidity', //52
    'pcs2Humidity', //132
    //Charge/Discharge Monitoring
    'pcs1ChargePower', //423
    'pcs1DischargePower', //424
    'pcs2ChargePower', //503
    'pcs2DischargePower', //504
    'chargeLimit', //64
    'dischargeLimit', //65

    //Energy Monitoring
    'pcs1TotalCharge', //472
    'pcs1TotalDischarge', //474
    'pcs1BatteryNominalEnergy', //476

    'pcs2TotalCharge', //552
    'pcs2TotalDischarge',
    'pcs2BatteryNominalEnergy', //576
    //DC Monitoring
    'pcs1DcSideVoltage', //422
    'pcs2DcSideVoltage', //502
    'pcs1DcSideCurrent', //420
    'pcs2DcSideCurrent', //500
    'pcs1DcInsulationResistance', //471
    'pcs2DcInsulationResistance', //551
    //Battery Packs Monitoring
    'pcs1HighestPackTemp', //432
    'pcs2HighestPackTemp', //512
    'pcs1CellWithHighestTemp', //434
    'pcs2CellWithHighestTemp', //514
    'pcs1LowestPackTemp', //431
    'pcs2LowestPackTemp', //511
    'pcs1CellWithLowestTemp', //433
    'pcs2CellWithLowestTemp', //513
    'pcs1LowestCellVoltage', //425
    'pcs2LowestCellVoltage', //505
    'pcs1HighestCellVoltage', //426
    'pcs2HighestCellVoltage', //506
    'pcs1CellWithHighestVoltage', //428
    'pcs2CellWithHighestVoltage', //508
    'pcs1CellWithLowestVoltage', //427
    'pcs2CellWithLowestVoltage', //507
    'pcs1HVStatusOfGroup', //436
    'pcs2HVStatusOfGroup', //516
    'pcs1GroupErrorLevel', // 453
    'pcs2GroupErrorLevel', //533
    'pcs1AvgCellTemp', //435
    'pcs2AvgCellTemp', //515
]

const tagMonitoringPCS = [
    'pcs1OutputVoltagePhaseA',
    'pcs1OutputVoltagePhaseB',
    'pcs1OutputVoltagePhaseC',
    'pcs1OutputCurrentPhaseA',
    'pcs1OutputCurrentPhaseB',
    'pcs1OutputCurrentPhaseC',
    'pcs1DcInputCurrent',
    'pcs1DcInputVoltage',
    'pcs1DcInputPower',
    'pcs1OutputApparentPower',
    'pcs1OutputActivePower',
    'pcs1OutputReactivePower',
    'pcs1BmsSoc',
    'pcs1TotalDischarge',
    'pcs1TotalCharge',
    'pcs1RunningStatus', //1078
    'pcs1WorkingMode', //1079
    'pcs2OutputVoltagePhaseA',
    'pcs2OutputVoltagePhaseB',
    'pcs2OutputVoltagePhaseC',
    'pcs2OutputCurrentPhaseA',
    'pcs2OutputCurrentPhaseB',
    'pcs2OutputCurrentPhaseC',
    'pcs2DcInputCurrent',
    'pcs2DcInputVoltage',
    'pcs2DcInputPower',
    'pcs2OutputApparentPower',
    'pcs2OutputActivePower',
    'pcs2OutputReactivePower',
    'pcs2BmsSoc', //509
    'pcs2TotalCharge', //552
    'pcs2TotalDischarge', //554
]

const addressPCSAlarms = ['5060', '5061', '5062', '5070', '5071', '5072']
// const addressPCSAlarms = [5060, 5061, 5062, 5070, 5071, 5072]

const tagGrid = [
    'gridPowerPh1',
    'gridPowerPh2',
    'gridPowerPh3',
    'gridVolt',
    'gridFreq',
    'gridPowerFactor',
    'gridVoltagePh1',
    'gridVoltagePh2',
    'gridVoltagePh3',
    'gridCurrentPh1',
    'gridCurrentPh2',
    'gridCurrentPh3',
    'gridPFPh1',
    'gridPFPh2',
    'gridPFPh3',
    'gridVoltageLine1',
    'gridVoltageLine2',
    'gridVoltageLine3',
    'gridPhaseAngle1',
    'gridPhaseAngle2',
    'gridPhaseAngle3',
]

const tagGenset = ['gensetStatus', 'gensetRunTime']

module.exports = {
    tagDashboard,
    tagOverview,
    tagSingleRack,
    tagPCSAlarm,
    tagPCSAlarm_2,
    batteryGroup,
    tagMonitoringPCS,
    addressPCSAlarms,
    tagGrid,
    tagGenset,
}
