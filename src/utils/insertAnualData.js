const CampoGrandeEnvironmentalServices = require('../model/readCGEnvironmental').CampoGrandeEnvironmentalServices;
const CampoGrandeProductionServices = require('../model/readCGProduction').CampoGrandeProductionServices;
const IreceEnvironmentalServices = require('../model/readIreceEnvironmental').IreceEnvironmentalServices;
const IreceProductionServices = require('../model/readIreceProduction').IreceProductionServices;
const AWSConfig = require('../config/config');
const docClient = AWSConfig.docClient;


// max
const max = (array) => {
    let max = 0
    array.map(item => {
        max = (item > max) ? item : max
    })
    return max
}

// Campo Grande Environmental

const CGEResolveMonthData = async (date) => {

    CampoGrandeEnvironmentalServices.readForOneMonth(date)
        .then(response => {
            let {
                averageIrradiations,
                higherIrradiations,
                averageTemperatures,
                higherTemperatures,
                lowerTemperatures,
                accumulateHumidities,
                averageWindSpeeds,
                accumulatePM1,
                averagesPM1,
                accumulatePM2,
                averagesPM2 } = response

            // Irradiacao 
            let hasIrradiation = averageIrradiations.length
            let effectiveIrradiations = (hasIrradiation)
                ? averageIrradiations.filter(item => item != null && !isNaN(item))
                : [0]
            let averageIrradiationsSum = (hasIrradiation)
                ? effectiveIrradiations.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageIrradiationsAverage = parseFloat((averageIrradiationsSum / effectiveIrradiations.length).toFixed(2))

            // Maior irradiacao do mes
            let hasHigherIrradiation = higherIrradiations.length
            let higherIrradiation = (hasHigherIrradiation)
                ? max(effectiveIrradiations)
                : "null"
            let higherIrradiationDay = (hasHigherIrradiation)
                ? higherIrradiations.indexOf(higherIrradiations) + 1
                : "null"

            // Temperatura
            let hasTemperatures = averageTemperatures.length
            let effectiveTemperature = (hasTemperatures)
                ? averageTemperatures.filter(item => item != null && !isNaN(item))
                : [0]

            let averageTemperaturesSum = (hasTemperatures)
                ? effectiveTemperature.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageTemperaturesAverage = parseFloat((averageTemperaturesSum / effectiveTemperature.length).toFixed(2))

            // Maior temperatura do mes
            let hasHigherTemperatures = higherTemperatures.length
            let effectiveHigherTemperatures = (hasHigherTemperatures)
                ? higherTemperatures.filter(item => item != "null")
                : [0]
            let higherTemperature = (hasHigherTemperatures)
                ? max(effectiveHigherTemperatures)
                : "null"
            let higherTemperatureDay = (hasHigherTemperatures)
                ? higherTemperatures.indexOf(higherTemperature) + 1
                : "null"

            // Menor temperatura do mes
            let hasLowerTemperatures = lowerTemperatures.length
            let effectiveLowerTemperatures = (hasLowerTemperatures)
                ? lowerTemperatures.filter(item => item != "null")
                : [0]
            let lowerTemperature = (hasLowerTemperatures)
                ? max(effectiveLowerTemperatures)
                : "null"
            let lowerTemperatureDay = (hasLowerTemperatures)
                ? lowerTemperatures.indexOf(lowerTemperature) + 1
                : "null"

            // Precipicação
            let hasAccumulateRainfall = accumulateHumidities.length
            let totalAccumulateRainfall = (hasAccumulateRainfall)
                ? accumulateHumidities.reduce((acc, cur) => acc + parseFloat(cur))
                : 0

            // Maior precipitação do mes
            let higherAccumulateRainfall = (hasAccumulateRainfall)
                ? max(accumulateHumidities)
                : "null"
            let higherAccumulateRainfallDay = (hasAccumulateRainfall)
                ? accumulateHumidities.indexOf(higherAccumulateRainfall)
                : "null"

            // Velocidade do vento
            let hasWindSpeed = averageWindSpeeds.length
            let effectiveWindSpeed = (hasWindSpeed)
                ? averageWindSpeeds.filter(item => item != null && !isNaN(item) && item === 0)
                : [0]
            let totalWindspeed = (hasWindSpeed)
                ? effectiveWindSpeed.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageWindSpeed = (hasWindSpeed)
                ? totalWindspeed / effectiveWindSpeed.length
                : "null"

            // Maior velocidade do vento do mes
            let higherWindSpeed = (hasWindSpeed)
                ? max(effectiveWindSpeed)
                : "null"
            let higherWindSpeedDay = (hasWindSpeed && averageWindSpeed != 0)
                ? averageWindSpeeds.indexOf(higherWindSpeed)
                : "null"

            // Massa PM1
            let hasAveragePM1 = averagesPM1.length
            let effectiveAveragePM1 = (hasAveragePM1)
                ? averagesPM1.filter(item => item != null && !isNaN(item))
                : [0]
            let totalAveragePM1 = (hasAveragePM1)
                ? effectiveAveragePM1.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averagePM1 = parseFloat((totalAveragePM1 / effectiveAveragePM1.length).toFixed(3))

            // Massa PM2
            let hasAveragePM2 = averagesPM2.length
            let effectiveAveragePM2 = (hasAveragePM2)
                ? averagesPM2.filter(item => item != null && !isNaN(item))
                : [0]
            let totalAveragePM2 = (hasAveragePM2)
                ? effectiveAveragePM2.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averagePM2 = parseFloat((totalAveragePM2 / effectiveAveragePM2.length).toFixed(3))

            // Concentração PM1
            let hasAccumulatePM1 = accumulatePM1.length
            let effectiveAccumulatePM1 = (hasAccumulatePM1)
                ? accumulatePM1.filter(item => item != null && !isNaN(item))
                : [0]
            let totalAccumulatePM1 = (hasAccumulatePM1)
                ? effectiveAccumulatePM1.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let accPM1 = parseFloat((totalAccumulatePM1 / effectiveAccumulatePM1.length).toFixed(3))

            // Maior Concontração PM1 do mes
            let higherPM1Concentration = (hasAccumulatePM1)
                ? max(accumulatePM1)
                : "null"
            let higherPM1ConcentrationDay = (hasAccumulatePM1)
                ? accumulatePM1.indexOf(higherPM1Concentration)
                : "null"

            // Concentração PM2
            let hasAccumulatePM2 = accumulatePM2.length
            let totalAccumulatePM2 = (hasAccumulatePM2)
                ? accumulatePM2.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let effectiveAccumulatePM2 = (hasAccumulatePM2)
                ? accumulatePM2.filter(item => item != null && !isNaN(item))
                : [0]
            let accPM2 = parseFloat((totalAccumulatePM2 / effectiveAccumulatePM2.length).toFixed(3))

            // Maior Concentração PM2 do mes
            let higherPM2Concentration = (hasAccumulatePM2)
                ? max(accumulatePM2)
                : "null"
            let higherPM2ConcentrationDay = (hasAccumulatePM2)
                ? accumulatePM2.indexOf(higherPM2Concentration)
                : "null"

            let items = {
                ano: parseInt(date[0] + date[1] + date[2] + date[3]),
                mes: date[4] + date[5],
                irradiation: {
                    averageIrradiation: averageIrradiationsAverage,
                    higherIrradiation,
                    higherIrradiationDay,
                },
                temperature: {
                    averageTemperature: averageTemperaturesAverage,
                    higherTemperature,
                    higherTemperatureDay,
                    lowerTemperature,
                    lowerTemperatureDay,
                },
                rainfall: {
                    accumulateRainfall: totalAccumulateRainfall,
                    higherAccumulateRainfall,
                    higherAccumulateRainfallDay,
                },
                windSpeed: {
                    averageWindSpeed,
                    higherWindSpeed,
                    higherWindSpeedDay,
                },
                PM1: {
                    accPM1,
                    averagePM1,
                    higherPM1Concentration,
                    higherPM1ConcentrationDay,
                },
                PM2: {
                    accPM2,
                    averagePM2,
                    higherPM2Concentration,
                    higherPM2ConcentrationDay
                }
            }

            let params = {
                TableName: "ambientais_ufms_anual",
                Item: items
            }

            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(JSON.stringify(err))
                } else {
                    console.log("put item: ", JSON.stringify(data))
                }
            })

        })
        .catch(err => {
            console.log(err)
        })

}

// Campo Grande Production

const CGPresolveMonth = async (date) => {
    let ano = parseInt(date[0] + date[1] + date[2] + date[3])
    let mes = date[4] + date[5]

    CampoGrandeProductionServices.readForOneMonth(date)
        .then(response => {
            let {
                averages,
                capacityFactor,
                productions,
                performances,
            } = response

            //averageProduction
            let hasAverageProduciton = averages.length
            let effectiveAverageProduction = (hasAverageProduciton)
                ? averages.filter(item => item != "null" && !isNaN(item))
                : [0]
            let averagesSum = (hasAverageProduciton)
                ? effectiveAverageProduction.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageProduction = averagesSum / effectiveAverageProduction.length

            //capacityFactorAverage
            let hasCapacityFactor = capacityFactor.length
            let effectiveCapacityFactor = (hasCapacityFactor)
                ? capacityFactor.filter(item => item != 'null' && !isNaN(item))
                : [0]
            let capacityFactorSum = (hasCapacityFactor)
                ? effectiveCapacityFactor.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let capacityFactorAverage = capacityFactorSum / effectiveCapacityFactor.length

            //higherAverage
            let higherAverage = max(effectiveCapacityFactor)
            let averagesWithoutHigherAverage = effectiveCapacityFactor.filter(item => item < higherAverage)
            let higherAverageThatsNot100Percent = max(averagesWithoutHigherAverage)

            //higherAverageDay
            let higherAverageDay = capacityFactor.indexOf(higherAverage)

            //performancesAverage
            let hasPerformances = performances.length
            let effectivePerformances = (hasPerformances)
                ? performances.filter(item => item != 'null' && !isNaN(item) && item != 0)
                : [0]
            let performancesSum = (hasPerformances)
                ? effectivePerformances.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let performancesAverage = performancesSum / effectivePerformances.length

            //totalProductionAverage
            let hasProductions = productions.length
            let effectiveProductions = (hasProductions)
                ? productions.filter(item => item != 'null' && !isNaN(item) && item != 0)
                : [0]
            let productionsSum = (hasProductions)
                ? effectiveProductions.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let totalProductionAverage = productionsSum / effectiveProductions.length

            let params = {
                TableName: "inversor_1_ufms_anual",
                Item: {
                    ano,
                    mes,
                    averageProduction,
                    capacityFactorAverage,
                    higherAverage: higherAverageThatsNot100Percent,
                    higherAverageDay,
                    performancesAverage,
                    totalProductionAverage,
                    productionsSum: averagesSum
                }
            }

            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("put item: ", data, params.Item.ano, params.Item.mes)
                }
            })

        })
        .catch(err => {
            console.log(err)
        })
}

// Irece Environmental

const IEresolveMonthData = async (date) => {

    IreceEnvironmentalServices.readForOneMonth(date)
        .then(response => {
            let {
                averageIrradiations,
                higherIrradiations,
                averageTemperatures,
                higherTemperatures,
                lowerTemperatures,
                accumulateRainfall,
                averageWindSpeeds } = response

            // Irradiacao 
            let hasIrradiation = averageIrradiations.length
            let effectiveIrradiations = (hasIrradiation)
                ? averageIrradiations.filter(item => item != null && !isNaN(item))
                : [0]
            let averageIrradiationsSum = (hasIrradiation)
                ? effectiveIrradiations.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageIrradiationsAverage = parseFloat((averageIrradiationsSum / effectiveIrradiations.length).toFixed(2))

            // Maior irradiacao do mes
            let hasHigherIrradiation = higherIrradiations.length
            let higherIrradiation = (hasHigherIrradiation)
                ? max(higherIrradiations)
                : "null"
            let higherIrradiationDay = (hasHigherIrradiation)
                ? higherIrradiations.indexOf(higherIrradiation) + 1
                : "null"

            // Temperatura
            let hasTemperatures = averageTemperatures.length
            let effectiveTemperature = (hasTemperatures)
                ? averageTemperatures.filter(item => item != null && !isNaN(item))
                : [0]

            let averageTemperaturesSum = (hasTemperatures)
                ? effectiveTemperature.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageTemperaturesAverage = parseFloat((averageTemperaturesSum / effectiveTemperature.length).toFixed(2))

            // Maior temperatura do mes
            let hasHigherTemperatures = higherTemperatures.length
            let effectiveHigherTemperatures = (hasHigherTemperatures)
                ? higherTemperatures.filter(item => item != "null")
                : [0]
            let higherTemperature = (hasHigherTemperatures)
                ? max(effectiveHigherTemperatures)
                : "null"
            let higherTemperatureDay = (hasHigherTemperatures)
                ? higherTemperatures.indexOf(higherTemperature) + 1
                : "null"

            // Menor temperatura do mes
            let hasLowerTemperatures = lowerTemperatures.length
            let effectiveLowerTemperatures = (hasLowerTemperatures)
                ? lowerTemperatures.filter(item => item != "null")
                : [0]
            let lowerTemperature = (hasLowerTemperatures)
                ? max(effectiveLowerTemperatures)
                : "null"
            let lowerTemperatureDay = (hasLowerTemperatures)
                ? lowerTemperatures.indexOf(lowerTemperature) + 1
                : "null"

            // Precipicação
            let hasAccumulateRainfall = accumulateRainfall.length
            let totalAccumulateRainfall = (hasAccumulateRainfall)
                ? accumulateRainfall.reduce((acc, cur) => acc + parseFloat(cur))
                : 0

            // Maior precipitação do mes
            let higherAccumulateRainfall = (hasAccumulateRainfall)
                ? max(accumulateRainfall)
                : "null"
            let higherAccumulateRainfallDay = (hasAccumulateRainfall)
                ? accumulateRainfall.indexOf(higherAccumulateRainfall)
                : "null"

            // Velocidade do vento
            let hasWindSpeed = averageWindSpeeds.length
            let effectiveWindSpeed = (hasWindSpeed)
                ? averageWindSpeeds.filter(item => item != null && !isNaN(item))
                : [0]
            let totalWindspeed = (hasWindSpeed)
                ? effectiveWindSpeed.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageWindSpeed = (hasWindSpeed)
                ? parseFloat((totalWindspeed / effectiveWindSpeed.length).toFixed(3))
                : "null"

            // Maior velocidade do vento do mes
            let higherWindSpeed = (hasWindSpeed)
                ? max(effectiveWindSpeed)
                : "null"
            let higherWindSpeedDay = (hasWindSpeed && averageWindSpeed != 0)
                ? averageWindSpeeds.indexOf(higherWindSpeed)
                : "null"

            let items = {
                ano: parseInt(date[0] + date[1] + date[2] + date[3]),
                mes: date[4] + date[5],
                irradiation: {
                    averageIrradiation: averageIrradiationsAverage,
                    higherIrradiation,
                    higherIrradiationDay,
                },
                temperature: {
                    averageTemperature: averageTemperaturesAverage,
                    higherTemperature,
                    higherTemperatureDay,
                    lowerTemperature,
                    lowerTemperatureDay,
                },
                rainfall: {
                    accumulateRainfall: totalAccumulateRainfall,
                    higherAccumulateRainfall,
                    higherAccumulateRainfallDay,
                },
                windSpeed: {
                    averageWindSpeed,
                    higherWindSpeed,
                    higherWindSpeedDay,
                }
            }

            // console.log(items)

            let params = {
                TableName: "ambientais_ifba_anual",
                Item: items
            }

            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(JSON.stringify(err))
                } else {
                    console.log("put item: ", JSON.stringify(data), items.ano, items.mes)
                }
            })

        })
        .catch(err => {
            console.log(err)
        })

}

// Irece Production (tables 1 to 5)

const IPResolveMonthData = async (date, tableNumber) => {
    let ano = parseInt(date[0] + date[1] + date[2] + date[3])
    let mes = date[4] + date[5]

    IreceProductionServices.readForOneMonth(date, tableNumber)
        .then(response => {
            let {
                averages,
                capacityFactor,
                productions,
                performances,
                performanceRatioComparison
            } = response

            //averageProduction
            let hasAverageProduciton = averages.length
            let effectiveAverageProduction = (hasAverageProduciton)
                ? averages.filter(item => item != "null" && !isNaN(item))
                : [0]
            let averagesSum = (hasAverageProduciton)
                ? effectiveAverageProduction.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let averageProduction = parseFloat((averagesSum / effectiveAverageProduction.length).toFixed(3))

            //capacityFactorAverage
            let hasCapacityFactor = capacityFactor.length
            let effectiveCapacityFactor = (hasCapacityFactor)
                ? capacityFactor.filter(item => item != 'null' && !isNaN(item))
                : [0]
            let capacityFactorSum = (hasCapacityFactor)
                ? effectiveCapacityFactor.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let capacityFactorAverage = parseFloat((capacityFactorSum / effectiveCapacityFactor.length).toFixed(3))

            //higherAverage
            let higherAverage = max(effectiveCapacityFactor)

            //higherAverageDay
            let higherAverageDay = capacityFactor.indexOf(higherAverage)

            //performancesAverage
            let hasPerformances = performances.length
            let effectivePerformances = (hasPerformances)
                ? performances.filter(item => item != 'null' && !isNaN(item) && item != 0 && item != Infinity)
				: [0]
				
            let performancesSum = (effectivePerformances.length != 0)
                ? effectivePerformances.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
			let performancesAverage = parseFloat((performancesSum / (effectivePerformances.length != 0 ? effectivePerformances.length : 1)).toFixed(3))

            //totalProductionAverage
            let hasProductions = productions.length
            let effectiveProductions = (hasProductions)
                ? productions.filter(item => item != 'null' && !isNaN(item) && item != 0)
                : [0]
            let productionsSum = (effectiveProductions.length != 0)
                ? effectiveProductions.reduce((acc, cur) => acc + parseFloat(cur))
                : 0
            let totalProductionAverage = parseFloat((productionsSum / (effectiveProductions.length != 0 ? effectiveProductions.length : 1)).toFixed(3))

            let params = {
                TableName: `inversor_${tableNumber}_irece_anual`,
                Item: {
                    ano,
                    mes,
                    averageProduction,
                    capacityFactorAverage,
                    higherAverage,
                    higherAverageDay,
                    performancesAverage,
                    totalProductionAverage,
                    productionsSum: averagesSum
                }
			}
			
            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("put item: ", params.Item)
                }
            })

        })
        .catch(err => {
            console.log(err)
        })
}

// Irece Production (total)

const IPTotalResolveMonthData = async (date, tableNumber) => {
    let ano = parseInt(date[0] + date[1] + date[2] + date[3])
    let mes = date[4] + date[5]

    IreceProductionServices.readForOneMonth(date, tableNumber)
        .then(response => {
            let {
				table1,
				table2,
				table3,
				table4,
				table5,
				table6
            } = response

			// Table 2
			let hasTable1 = (table1.length != 0 && table1.length != 'null')
			let effectiveTable1 = (hasTable1)
				? table1.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable1 = (effectiveTable1.length != 0 && effectiveTable1.length != 'null')
			let table1Sum = (hasEffectiveTable1)
				? effectiveTable1.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table1Average = parseFloat((table1Sum / (effectiveTable1.length != 0 ? effectiveTable1.length : 1)).toFixed(3))
			
			let higherProductionTable1 = max(effectiveTable1)
			let higherProductionTable1Day = table1.indexOf(higherProductionTable1) + 1

			// Table2
			let hasTable2 = (table2.length != 0 && table2.length != 'null')
			let effectiveTable2 = (hasTable2)
				? table2.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable2 = (effectiveTable2.length != 0 && effectiveTable2.length != 'null')
			let table2Sum = (hasEffectiveTable2)
				? effectiveTable2.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table2Average = parseFloat((table2Sum / (effectiveTable2.length != 0 ? effectiveTable2.length : 1)).toFixed(3))
			
			let higherProductionTable2 = max(effectiveTable2)
			let higherProductionTable2Day = table2.indexOf(higherProductionTable2) + 1

			// Table3
			let hasTable3 = (table3.length != 0 && table3.length != 'null')
			let effectiveTable3 = (hasTable3)
				? table3.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable3 = (effectiveTable3.length != 0 && effectiveTable3.length != 'null')
			let table3Sum = (hasEffectiveTable3)
				? effectiveTable3.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table3Average = parseFloat((table3Sum / (effectiveTable3.length != 0 ? effectiveTable3.length : 1)).toFixed(3))
			
			let higherProductionTable3 = max(effectiveTable3)
			let higherProductionTable3Day = table3.indexOf(higherProductionTable3) + 1

			// Table4
			let hasTable4 = (table4.length != 0 && table4.length != 'null')
			let effectiveTable4 = (hasTable4)
				? table4.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable4 = (effectiveTable4.length != 0 && effectiveTable4.length != 'null')
			let table4Sum = (hasEffectiveTable4)
				? effectiveTable4.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table4Average = parseFloat((table4Sum / (effectiveTable4.length != 0 ? effectiveTable4.length : 1)).toFixed(3))
			
			let higherProductionTable4 = max(effectiveTable4)
			let higherProductionTable4Day = table4.indexOf(higherProductionTable4) + 1

			
			// Table5
			let hasTable5 = (table5.length != 0 && table5.length != 'null')
			let effectiveTable5 = (hasTable5)
				? table5.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable5 = (effectiveTable5.length != 0 && effectiveTable5.length != 'null')
			let table5Sum = (hasEffectiveTable5)
				? effectiveTable5.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table5Average = parseFloat((table5Sum / (effectiveTable5.length != 0 ? effectiveTable5.length : 1)).toFixed(3))
			
			let higherProductionTable5 = max(effectiveTable5)
			let higherProductionTable5Day = table5.indexOf(higherProductionTable5) + 1

			// Table6
			let hasTable6 = (table6.length != 0 && table6.length != 'null')
			let effectiveTable6 = (hasTable6)
				? table6.filter(item => item != undefined && item != Infinity && item != 'null' != item != 0)
				: [0]
			let hasEffectiveTable6 = (effectiveTable6.length != 0 && effectiveTable6.length != 'null')
			let table6Sum = (hasEffectiveTable6)
				? effectiveTable6.reduce((acc, cur) => acc + parseFloat(cur))
				: 0
			let table6Average = parseFloat((table6Sum / (effectiveTable6.length != 0 ? effectiveTable6.length : 1)).toFixed(3))
			
			let higherProductionTable6 = max(effectiveTable6)
            let higherProductionTable6Day = table6.indexOf(higherProductionTable6) + 1
            
            let total = parseFloat(table1Sum) + parseFloat(table2Sum) + parseFloat(table3Sum) + parseFloat(table4Sum) + parseFloat(table5Sum)


            let params = {
                TableName: `inversor_${tableNumber}_irece_anual`,
                Item: {
                    ano,
                    mes,
                    table1: {
                        total: table1Sum,
						averageProduction: table1Average,
						higherAverageProduction: higherProductionTable1,
						higherAverageProductionDay: higherProductionTable1Day
					},
					table2: {
                        total: table2Sum,
						averageProduction: table2Average,
						higherAverageProduction: higherProductionTable2,
						higherAverageProductionDay: higherProductionTable2Day
					},
					table3: {
                        total: table3Sum,
						averageProduction: table3Average,
						higherAverageProduction: higherProductionTable3,
						higherAverageProductionDay: higherProductionTable3Day
					},
					table4: {
                        total: table4Sum,
						averageProduction: table4Average,
						higherAverageProduction: higherProductionTable4,
						higherAverageProductionDay: higherProductionTable4Day
					},
					table5: {
                        total: table5Sum,
						averageProduction: table5Average,
						higherAverageProduction: higherProductionTable5,
						higherAverageProductionDay: higherProductionTable5Day
					},
					table6: {
                        total,
						averageProduction: table6Average,
						higherAverageProduction: higherProductionTable6,
						higherAverageProductionDay: higherProductionTable6Day
					}
                }
			}

			// console.log(params.Item)
			
            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("put item: ", params.Item)
                }
            })

        })
        .catch(err => {
            console.log(err)
        })
}

let date = {
    year: '2018',
    month: '09',
    day: '01'
}

const interval = setInterval(async () => {

    if (date.year + date.month < '202001' && date.month < 12) {
        // await CGPresolveMonth(date.year + date.month + date.day)
        date.month = parseInt(date.month)
        date.month++
        date.month = (date.month >= 10) ? date.month : ('0' + date.month).slice(-2)
    } else if (date.year + date.month < '202001' && date.month == 12) {
        // await CGPresolveMonth(date.year + date.month + date.day)
        date.year = parseInt(date.year)
        date.year++
        date.year = JSON.stringify(date.year)
        date.month = "01"
    } else clearInterval(interval)

}, 15000)
