// max
const max = (array) => {
    let max = 0
    array.map(item => {
        max = (item > max) ? item : max
    })
    return max
}

// Campo Grande Environmental

const resolveMonthData = (date) => {

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

            // console.log(items)

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

const resolveMonth = (date) => {
    let ano = parseInt(date[0] + date[1] + date[2] + date[3])
    let mes = date[4] + date[5]

    CampoGrandeProductionServices.readForOneMonth(date)
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
                    higherAverage,
                    higherAverageDay,
                    performancesAverage,
                    totalProductionAverage,
                }
            }

            docClient.put(params, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("put item: ", data)
                }
            })

        })
        .catch(err => {
            console.log(err)
        })
}