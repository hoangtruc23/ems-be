const ftpConstant = [
    {
        name: 'cabinetTemperature',
        header: 'Cabinet Temp (C)',
    },
    {
        name: 'pcs1Humidity',
        header: 'Cabinet Humidity (%)',
    },
    {
        name: 'bessSoc',
        header: 'BESS SOC (%)',
    },
    {
        name: 'bessSoH',
        header: 'BESS SOH (%)',
    },
    {
        name: 'gensetStatus',
        header: 'Genset Status',
    },
    {
        name: 'solarTotalRate1SumSolar',
        header: 'TOTAL Rate 1 Current active energy sum Solar (kWh)',
    },
    {
        name: 'solarTotalRate1SumTodaySolar',
        header: 'Total Rate 1 Current active energy sum today Solar (kWh)',
    },
    {
        name: 'solarTotalRate2SumSolar',
        header: 'TOTAL Rate 2 Current active energy sum Solar (kWh)',
    },
    {
        name: 'solarTotalRate2SumTodaySolar',
        header: 'Total Rate 2 Current active energy sum today Solar (kWh)',
    },
    {
        name: 'solarTotalInstantaneousSumSolar',
        header: 'Total Instantaneous active power sum Solar (kW)',
    },
    {
        name: 'solarAVGVoltageSolar',
        header: 'AVG Voltage Solar (V)',
    },
    {
        name: 'solarTotalAmpereSolar',
        header: 'Total Ampere Solar (A)',
    },
    {
        name: 'solarFreqSolar',
        header: 'Freq Solar (Hz)',
    },
    {
        name: 'totalBessRate1SumImport',
        header: 'TOTAL BESS Rate 1 Current active energy sum Import (kWh)',
    },
    {
        name: 'totalBessRate1SumTodayImport',
        header: 'Total BESS Rate 1 Current active energy sum today Import (kWh)',
    },
    {
        name: 'totalBessRate2SumImport',
        header: 'TOTAL BESS Rate 2 Current active energy sum Import (kWh)',
    },
    {
        name: 'totalBessRate2SumTodayImport',
        header: 'Total BESS Rate 2 Current active energy sum today Import (kWh)',
    },
    {
        name: 'totalBessRate3SumImport',
        header: 'TOTAL BESS Rate 3 Current active energy sum Import (kWh)',
    },
    {
        name: 'totalBessRate3SumTodayImport',
        header: 'Total BESS Rate 3 Current active energy sum today Import (kWh)',
    },
    {
        name: 'totalBessRate1SumExport',
        header: 'TOTAL BESS Rate 1 Current active energy sum Export (kWh)',
    },
    {
        name: 'totalBessRate1SumTodayExport',
        header: 'Total BESS Rate 1 Current active energy sum today Export (kWh)',
    },
    {
        name: 'totalBessRate2SumExport',
        header: 'TOTAL BESS Rate 2 Current active energy sum Export (kWh)',
    },
    {
        name: 'totalBessRate2SumTodayExport',
        header: 'Total BESS Rate 2 Current active energy sum today Export (kWh)',
    },
    {
        name: 'totalBessRate3SumExport',
        header: 'TOTAL BESS Rate 3 Current active energy sum Export (kWh)',
    },
    {
        name: 'totalBessRate3SumTodayExport',
        header: 'Total BESS Rate 3 Current active energy sum today Export (kWh)',
    },
    {
        name: 'chargeDischargeAvgVoltage',
        header: 'Charge/Discharge avg Voltage BESS (V)',
    },
    {
        name: 'chargeDischargeTotalAmpere',
        header: 'Charge/Discharge Total Ampere BESS (A)',
    },
    {
        name: 'chargeDischargeFreq',
        header: 'Charge/Discharge Freq BESS (Hz)',
    },
    {
        name: 'totalInstantaneousPowerSum',
        header: 'Total Instantaneous active power sum BESS (kW)',
    },
    {
        name: 'chargeDischargePhase1',
        header: 'Charge/Discharge Phase 1 (kW)',
    },
    {
        name: 'chargeDischargePhase2',
        header: 'Charge/Discharge Phase 2 (kW)',
    },
    {
        name: 'chargeDischargePhase3',
        header: 'Charge/Discharge Phase 3 (kW)',
    },
    {
        name: 'sumGridTotal', // gridTotal + gridTotalPMSolar
        header: 'Grid Total (kWh)',
    },
    {
        name: 'sumImportPower', //importPower + importPowerSolar
        header: 'Grid Power (kW)',
    },
    {
        name: 'sumGridPowerPh1',
        header: 'Grid Power Ph1 (kW)',
    },
    {
        name: 'sumGridPowerPh2',
        header: 'Grid Power Ph2 (kW)',
    },
    {
        name: 'sumGridPowerPh3',
        header: 'Grid Power Ph3 (kW)',
    },
    {
        name: 'avgGridVolt',
        header: 'Grid Volt',
    },
    {
        name: 'sumGridAmp',
        header: 'Grid Amp',
    },
    {
        name: 'avgGridFreq',
        header: 'Grid Freq',
    },
    {
        name: 'avgGridPowerFactor',
        header: 'Grid Power Factor',
    },
    {
        name: 'avgGridVoltagePh1',
        header: 'Grid Voltage Phase 1',
    },
    {
        name: 'avgGridVoltagePh2',
        header: 'Grid Voltage Phase 2',
    },
    {
        name: 'avgGridVoltagePh3',
        header: 'Grid Voltage Phase 3',
    },
    {
        name: 'sumGridCurrentPh1',
        header: 'Grid Current Phase 1',
    },
    {
        name: 'sumGridCurrentPh2',
        header: 'Grid Current Phase 2',
    },
    {
        name: 'sumGridCurrentPh3',
        header: 'Grid Current Phase 3',
    },
    {
        name: 'pcs1RunningStatus',
        header: 'PCS1 Status',
    },
    {
        name: 'pcs1WorkingMode',
        header: 'PCS1 Working Mode',
    },
    {
        name: 'bessRack01TotalCharged',
        header: 'Rack 01 Total Charged (kWh)',
    },
    {
        name: 'rack01PowerCharge',
        header: 'Rack 01 Power Charge (kW)',
    },
    {
        name: 'rack01TotalDischarged',
        header: 'Rack 01 Total Discharged (kWh)',
    },
    {
        name: 'rack01PowerDischarge',
        header: 'Rack 01 Power Discharge (kW)',
    },
    {
        name: 'singleRack1OfBRMU1HV',
        header: 'Rack 01 Status',
    },
    {
        name: 'singleRack1OfBRMU1Err',
        header: 'Rack 01 Alarm',
    },
    {
        name: 'rack01AverageTemp',
        header: 'Rack 01 Average Temp',
    },
    {
        name: 'singleRack1OfBRMU1SoC',
        header: 'Rack 01 SOC (%)',
    },
    {
        name: 'singleRack1OfBRMU1SoH',
        header: 'Rack 01  SOH (%)',
    },
    {
        name: 'singleRack1OfBRMU1Current', //2640
        header: 'Rack 01 Current (A)',
    },
    {
        name: 'singleRack1OfBRMU1Voltage', //2641
        header: 'Rack 01 Voltage (V)',
    },
    {
        name: 'rack02TotalCharged',
        header: 'Rack 02 Total Charged (kWh)',
    },
    {
        name: 'rack02PowerCharge',
        header: 'Rack 02 Power Charge (kW)',
    },
    {
        name: 'rack02TotalDischarged',
        header: 'Rack 02 Total Discharged (kWh)',
    },
    {
        name: 'rack02PowerDischarge',
        header: 'Rack 02 Power Discharge (kW)',
    },
    {
        name: 'singleRack2OfBRMU1HV',
        header: 'Rack 02 Status',
    },
    {
        name: 'singleRack2OfBRMU1Err',
        header: 'Rack 02 Alarm',
    },
    {
        name: 'rack02AverageTemp',
        header: 'Rack 02 Average Temp',
    },
    {
        name: 'singleRack2OfBRMU1SoC',
        header: 'Rack 02 SOC (%)',
    },
    {
        name: 'singleRack2OfBRMU1SoH',
        header: 'Rack 02  SOH (%)',
    },
    {
        name: 'singleRack2OfBRMU1Current', //2690
        header: 'Rack 02 Current (A)',
    },
    {
        name: 'singleRack2OfBRMU1Voltage', //2691
        header: 'Rack 02 Voltage (V)',
    },
    {
        name: 'rack03TotalCharged',
        header: 'Rack 03 Total Charged (kWh)',
    },
    {
        name: 'rack03PowerCharge',
        header: 'Rack 03 Power Charge (kW)',
    },
    {
        name: 'rack03TotalDischarged',
        header: 'Rack 03 Total Discharged (kWh)',
    },
    {
        name: 'rack03PowerDischarge',
        header: 'Rack 03 Power Discharge (kW)',
    },
    {
        name: 'singleRack3OfBRMU1HV',
        header: 'Rack 03 Status',
    },
    {
        name: 'singleRack3OfBRMU1Err',
        header: 'Rack 03 Alarm',
    },
    {
        name: 'rack03AverageTemp',
        header: 'Rack 03 Average Temp',
    },
    {
        name: 'singleRack3OfBRMU1SoC',
        header: 'Rack 03 SOC (%)',
    },
    {
        name: 'singleRack3OfBRMU1SoH',
        header: 'Rack 03  SOH (%)',
    },
    {
        name: 'singleRack3OfBRMU1Current', //2740
        header: 'Rack 03 Current (A)',
    },
    {
        name: 'singleRack3OfBRMU1Voltage', //2741
        header: 'Rack 03 Voltage (V)',
    },
    {
        name: 'rack04TotalCharged',
        header: 'Rack 04 Total Charged (kWh)',
    },
    {
        name: 'rack04PowerCharge',
        header: 'Rack 04 Power Charge (kW)',
    },
    {
        name: 'rack04TotalDischarged',
        header: 'Rack 04 Total Discharged (kWh)',
    },
    {
        name: 'rack04PowerDischarge',
        header: 'Rack 04 Power Discharge (kW)',
    },
    {
        name: 'singleRack4OfBRMU1HV',
        header: 'Rack 04 Status',
    },
    {
        name: 'singleRack4OfBRMU1Err',
        header: 'Rack 04 Alarm',
    },
    {
        name: 'rack04AverageTemp',
        header: 'Rack 04 Average Temp',
    },
    {
        name: 'singleRack4OfBRMU1SoC',
        header: 'Rack 04 SOC (%)',
    },
    {
        name: 'singleRack4OfBRMU1SoH',
        header: 'Rack 04  SOH (%)',
    },
    {
        name: 'singleRack4OfBRMU1Current', //2790
        header: 'Rack 04 Current (A)',
    },
    {
        name: 'singleRack4OfBRMU1Voltage', //2791
        header: 'Rack 04 Voltage (V)',
    },
    {
        name: 'rack05TotalCharged',
        header: 'Rack 05 Total Charged (kWh)',
    },
    {
        name: 'rack05PowerCharge',
        header: 'Rack 05 Power Charge (kW)',
    },
    {
        name: 'rack05TotalDischarged',
        header: 'Rack 05 Total Discharged (kWh)',
    },
    {
        name: 'rack05PowerDischarge',
        header: 'Rack 05 Power Discharge (kW)',
    },
    {
        name: 'singleRack5OfBRMU1HV',
        header: 'Rack 05 Status',
    },
    {
        name: 'singleRack5OfBRMU1Err',
        header: 'Rack 05 Alarm',
    },
    {
        name: 'rack05AverageTemp',
        header: 'Rack 05 Average Temp',
    },
    {
        name: 'singleRack5OfBRMU1SoC',
        header: 'Rack 05 SOC (%)',
    },
    {
        name: 'singleRack5OfBRMU1SoH',
        header: 'Rack 05  SOH (%)',
    },
    {
        name: 'singleRack5OfBRMU1Current', //2840
        header: 'Rack 05 Current (A)',
    },
    {
        name: 'singleRack5OfBRMU1Voltage', //2841
        header: 'Rack 05 Voltage (V)',
    },
    {
        name: 'pcs2RunningStatus',
        header: 'PCS2 Status',
    },
    {
        name: 'pcs2WorkingMode',
        header: 'PCS2 Working Mode',
    },
    {
        name: 'rack01TotalChargedG2',
        header: 'Rack 06 Total Charged (kWh)',
    },
    {
        name: 'rack01PowerChargeG2',
        header: 'Rack 06 Power Charge (kW)',
    },
    {
        name: 'rack01TotalDischargedG2',
        header: 'Rack 06 Total Discharged (kWh)',
    },
    {
        name: 'rack01PowerDischargeG2',
        header: 'Rack 06 Power Discharge (kW)',
    },
    {
        name: 'singleRack1OfBRMU2HV',
        header: 'Rack 06 Status',
    },
    {
        name: 'singleRack1OfBRMU2Err',
        header: 'Rack 06 Alarm',
    },
    {
        name: 'rack01AverageTempG2',
        header: 'Rack 06 Average Temp',
    },

    {
        name: 'singleRack1OfBRMU2SoC',
        header: 'Rack 06 SOC (%)',
    },
    {
        name: 'singleRack1OfBRMU2SoH',
        header: 'Rack 06  SOH (%)',
    },
    {
        name: 'singleRack1OfBRMU2Current', //3440
        header: 'Rack 06 Current (A)',
    },
    {
        name: 'singleRack1OfBRMU2Voltage', //3441
        header: 'Rack 06 Voltage (V)',
    },
    {
        name: 'rack02TotalChargedG2',
        header: 'Rack 07 Total Charged (kWh)',
    },
    {
        name: 'rack02PowerChargeG2',
        header: 'Rack 07 Power Charge (kW)',
    },
    {
        name: 'rack02TotalDischargedG2',
        header: 'Rack 07 Total Discharged (kWh)',
    },
    {
        name: 'rack02PowerDischargeG2',
        header: 'Rack 07 Power Discharge (kW)',
    },
    {
        name: 'singleRack2OfBRMU2HV',
        header: 'Rack 07 Status',
    },
    {
        name: 'singleRack2OfBRMU2Err',
        header: 'Rack 07 Alarm',
    },
    {
        name: 'rack02AverageTempG2',
        header: 'Rack 07 Average Temp',
    },
    {
        name: 'singleRack2OfBRMU2SoC',
        header: 'Rack 07 SOC (%)',
    },
    {
        name: 'singleRack2OfBRMU2SoH',
        header: 'Rack 07  SOH (%)',
    },
    {
        name: 'singleRack2OfBRMU2Current', //3490
        header: 'Rack 07 Current (A)',
    },
    {
        name: 'singleRack2OfBRMU2Voltage', //3491
        header: 'Rack 07 Voltage (V)',
    },
    {
        name: 'rack03TotalChargedG2',
        header: 'Rack 08 Total Charged (kWh)',
    },
    {
        name: 'rack03PowerChargeG2',
        header: 'Rack 08 Power Charge (kW)',
    },
    {
        name: 'rack03TotalDischargedG2',
        header: 'Rack 08 Total Discharged (kWh)',
    },
    {
        name: 'rack03PowerDischargeG2',
        header: 'Rack 08 Power Discharge (kW)',
    },
    {
        name: 'singleRack3OfBRMU2HV',
        header: 'Rack 08 Status',
    },
    {
        name: 'singleRack3OfBRMU2Err',
        header: 'Rack 08 Alarm',
    },
    {
        name: 'rack03AverageTempG2',
        header: 'Rack 08 Average Temp',
    },
    {
        name: 'singleRack3OfBRMU2SoC',
        header: 'Rack 08 SOC (%)',
    },
    {
        name: 'singleRack3OfBRMU2SoH',
        header: 'Rack 08  SOH (%)',
    },
    {
        name: 'singleRack3OfBRMU2Current', //3540
        header: 'Rack 08 Current (A)',
    },
    {
        name: 'singleRack3OfBRMU2Voltage', //3541
        header: 'Rack 08 Voltage (V)',
    },
    {
        name: 'rack04TotalChargedG2',
        header: 'Rack 09 Total Charged (kWh)',
    },
    {
        name: 'rack04PowerChargeG2',
        header: 'Rack 09 Power Charge (kW)',
    },
    {
        name: 'rack04TotalDischargedG2',
        header: 'Rack 09 Total Discharged (kWh)',
    },
    {
        name: 'rack04PowerDischarge',
        header: 'Rack 09 Power Discharge (kW)',
    },
    {
        name: 'singleRack4OfBRMU2HV',
        header: 'Rack 09 Status',
    },
    {
        name: 'singleRack4OfBRMU2Err',
        header: 'Rack 09 Alarm',
    },
    {
        name: 'rack04AverageTemp',
        header: 'Rack 09 Average Temp',
    },
    {
        name: 'singleRack4OfBRMU2SoC',
        header: 'Rack 09 SOC (%)',
    },
    {
        name: 'singleRack4OfBRMU2SoH',
        header: 'Rack 09  SOH (%)',
    },
    {
        name: 'singleRack4OfBRMU2Current', //3590
        header: 'Rack 09 Current (A)',
    },
    {
        name: 'singleRack4OfBRMU2Voltage', //3591
        header: 'Rack 09 Voltage (V)',
    },
    {
        name: 'rack05TotalChargedG2',
        header: 'Rack 10 Total Charged (kWh)',
    },
    {
        name: 'rack05PowerChargeG2',
        header: 'Rack 10 Power Charge (kW)',
    },
    {
        name: 'rack05TotalDischargedG2',
        header: 'Rack 10 Total Discharged (kWh)',
    },
    {
        name: 'rack05PowerDischargeG2',
        header: 'Rack 10 Power Discharge (kW)',
    },
    {
        name: 'singleRack5OfBRMU2HV',
        header: 'Rack 10 Status',
    },
    {
        name: 'singleRack5OfBRMU2Err',
        header: 'Rack 10 Alarm',
    },
    {
        name: 'rack05AverageTempG2',
        header: 'Rack 10 Average Temp',
    },
    {
        name: 'singleRack5OfBRMU2SoC',
        header: 'Rack 10 SOC (%)',
    },
    {
        name: 'singleRack5OfBRMU2SoH',
        header: 'Rack 10  SOH (%)',
    },
    {
        name: 'singleRack5OfBRMU2Current', //3640
        header: 'Rack 10 Current (A)',
    },
    {
        name: 'singleRack5OfBRMU2Voltage', //3641
        header: 'Rack 10 Voltage (V)',
    },
]

const ftpGetValue = [
    { name: 'pcs1BmsSoc' }, // 429
    { name: 'pcs2BmsSoc' }, //509
    { name: 'pcs1StateOfHealth' }, //430
    { name: 'pcs2StateOfHealth' }, //510
    { name: 'gridTotal' },
    { name: 'gridTotalPMSolar' },
    { name: 'importPower' },
    { name: 'importPowerSolar' },
    { name: 'gridPowerPh1' },
    { name: 'gridPowerPh1PMSolar' },
    { name: 'gridPowerPh2' },
    { name: 'gridPowerPh2PMSolar' },
    { name: 'gridPowerPh3' },
    { name: 'gridPowerPh3PMSolar' },
    { name: 'gridVolt' },
    { name: 'gridVoltPMSolar' },
    { name: 'gridAmp' },
    { name: 'gridAmpPMSolar' },
    { name: 'gridFreq' },
    { name: 'gridFreqPMSolar' },
    { name: 'gridPowerFactor' },
    { name: 'gridPowerFactorPMSolar' },
    { name: 'gridVoltagePh1' },
    { name: 'gridVoltagePh1PMSolar' },
    { name: 'gridVoltagePh2' },
    { name: 'gridVoltagePh2PMSolar' },
    { name: 'gridVoltagePh3' },
    { name: 'gridVoltagePh3PMSolar' },
    { name: 'gridCurrentPh1' },
    { name: 'gridCurrentPh1PMSolar' },
    { name: 'gridCurrentPh2' },
    { name: 'gridCurrentPh2PMSolar' },
    { name: 'gridCurrentPh3' },
    { name: 'gridCurrentPh3PMSolar' },
]

const fileNameFtpConstant = ['GO_MALL_ThangLong', 'GY_RealTime']
// const fileNameFtpConstant = ['ASG_PPA1', 'ASG_PPA1_30min', 'GY_RealTime']

module.exports = { ftpConstant, fileNameFtpConstant, ftpGetValue }
