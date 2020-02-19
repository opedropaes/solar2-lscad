/* eslint-disable eqeqeq */
const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const daysInMonthDefiner = require('../utils/daysInMonthDefiner')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient

let now = new Date
let usedYear = now.getFullYear()
let usedMonth = now.getMonth() + 1
let usedDay = now.getDate()

const max = (array) => {
	let max = 0;
	
	if (array) {
		array.map(item => {
			if (item > max) 	max = item
		});
	}

	return max;
}

const correctTime = (lateTime, date) => {

	let hour = lateTime[0] + lateTime[1];
	let minutes = lateTime[2] + lateTime[3];
	
	if (date.year == 2020 && date.month == 2 && date.day > 15 && date.day < 20) {
		hour++;
		hour = (hour < 10) ? '0' + hour : hour;
	}
	
	return `${hour}:${minutes}`;
}

const normalize = (normalizer, maxValue, toBeNormalized) => {
	const normalized = (toBeNormalized * normalizer) / maxValue;
	return parseFloat((normalized).toFixed(3));
}

const requireAWSData = async (params, requestedDate) => {

	return new Promise((resolve, reject) => {

		let items = []
		let interval = []
		let sortedItems = []
		let completeInterval = []
		let completeIrradiation = []
		let sortedIrradiation = []
		let hourMinToPush = ""

		docClient.query(params, (err, data) => {
			if (err) {
				reject('Unable to scan table. Error JSON: ' + JSON.stringify(err, null, 2))
			}
			else {

				data.Items.forEach(function (item) {
					if (typeof data.Items != 'undefined') {
						if (item.hora_minuto >= 60000 && item.hora_minuto <= 190000) {
							
							let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)
							
							if (item.P_AC >= 20) {

								hourMinToPush = correctTime(item.hora_minuto, 
									({year: formatedDate.year, month: formatedDate.month, day: formatedDate.day}))
								
								items.push({
									pac: item.P_AC / 1000,
									iac: item.I_AC,
									idc: item.I_DC,
									vac: item.V_AC,
									vdc: item.V_DC,
									irr: item.IRR || 0,
									hour: hourMinToPush[0] + hourMinToPush[1],
									minutes: formatedDate.min,
									hourMin: hourMinToPush
								})
								
								completeInterval.push(hourMinToPush)
								completeIrradiation.push({
									irr: item.IRR || 0,
									hourMin: hourMinToPush
								})

								interval.push(hourMinToPush)
							}
						} else {

							let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)
							
							hourMinToPush = correctTime(item.hora_minuto, 
								({year: formatedDate.year, month: formatedDate.month, day: formatedDate.day}))

							completeInterval.push(hourMinToPush)
							completeIrradiation.push({
								irr: item.IRR || 0,
								hourMin: hourMinToPush
							})

						}
					}

				})

				interval.sort()
				completeInterval.sort()
				
				for (let hour of interval) {
					for (let item of items) {
						if (hour == item.hourMin) {

							if (usedMonth <= 6 && usedYear <= 2019 || usedYear == 2018 || (usedYear == 2019 && usedMonth == 7 && usedDay >= 15)) {
								sortedItems.push({
									pac: parseFloat((item.pac * 4).toFixed(3)),
									iac: parseFloat(item.iac.toFixed(3)),
									idc: parseFloat(item.idc.toFixed(3)),
									vac: parseFloat(item.vac.toFixed(3)),
									vdc: parseFloat(item.vdc.toFixed(3)),
									irr: parseFloat(item.irr/1000)
								})
							}
							else {
								sortedItems.push({
									pac: parseFloat(item.pac.toFixed(3)),
									iac: parseFloat(item.iac.toFixed(3)),
									idc: parseFloat(item.idc.toFixed(3)),
									vac: parseFloat(item.vac.toFixed(3)),
									vdc: parseFloat(item.vdc.toFixed(3)),
									irr: parseFloat(item.irr/1000)
								})
							}
						}
					}
				}

				for (let hour of completeInterval) {
					for (let item of completeIrradiation) {
						if (hour == item.hourMin) {
							sortedIrradiation.push(item.irr)
						}
					}
				}

			}

			let response = dataAverage(sortedItems, interval)
			resolve([
				response.averages,
				response.interval,
				response.capacityFactor,
				response.alternateCurrent,
				response.continuousCurrent,
				response.alternateTension,
				response.continuousTension,
				response.irradiation,
				response.totalProduction,
				response.irradiationQuarters,
				completeInterval,
				sortedIrradiation,
				response.irradiationAverage
			])

		})
	})
}

const dataAverage = (data, dates) => {

	try {
		let productionSumsPerMinute = 0
		let irradiationMinuteSum = 0
		let qtd = 0
		let irradiationCounter = 0

		let capacityFactor = []
		let interval = []
		let averages = []
		let alternateCurrent = []
		let continuousCurrent = []
		let alternateTension = []
		let continuousTension = []
		let irradiation = []
		let irradiationAverage = []
		let totalProduction = []
		let irradiationQuarters = []

		for (let i = 0; i < dates.length; i++) {

			totalProduction.push(parseFloat(data[i].pac))
			irradiation.push(data[i].irr)
			
			let minute = dates[i][3] + dates[i][4]

			productionSumsPerMinute += parseFloat(data[i].pac)
			qtd++

			irradiationMinuteSum += parseFloat(data[i].irr)
			irradiationCounter++

			if (minute % 15 == 0) {

				capacityFactor.push(parseFloat(((productionSumsPerMinute / qtd) / 8.2).toFixed(3)))
				averages.push(parseFloat(parseFloat(productionSumsPerMinute / qtd).toFixed(3)))
				alternateCurrent.push(data[i].iac)
				continuousCurrent.push(data[i].idc)
				alternateTension.push(data[i].vac)
				continuousTension.push(data[i].vdc)
				irradiationQuarters.push(data[i].irr)
				interval.push(dates[i])
				irradiationAverage.push(parseFloat((irradiationMinuteSum / irradiationCounter).toFixed(2)))

				qtd = 0
				productionSumsPerMinute = 0
				irradiationCounter = 0
				irradiationMinuteSum = 0

			}

		}

		return {
			averages,
			interval,
			capacityFactor,
			alternateCurrent,
			continuousCurrent,
			alternateTension,
			continuousTension,
			irradiation,
			totalProduction,
			irradiationQuarters,
			irradiationAverage,
		}

	} catch (error) {
		return error
	}

}

CampoGrandeProductionServices = {}

CampoGrandeProductionServices.readForOneDay = async (date) => {

	let dateToRequest = {
		day:
            date[6] +
            date[7],
		month:
            date[4] +
            date[5],
		year:
            date[0] +
            date[1] +
            date[2] +
            date[3]
	}

	return new Promise((resolve, reject) => {

		let params = tableDefiner.defineTable
		(
			'campo-grande',
			'production',
			null,
			dateToRequest.day,
			dateToRequest.month,
			dateToRequest.year,
			null
		)

		if(isNaN(params.ExpressionAttributeValues[':inicio_data'])) {
			let newExpressionAttributeValues = parseInt(date.year + date.month + date.day);
			params = {
				...params,
				ExpressionAttributeValues : newExpressionAttributeValues
			};
		}

		let requestedDate = {
			day: dateToRequest.day,
			month: dateToRequest.month,
			year: dateToRequest.year
		}

		requireAWSData(params, requestedDate)
			.then((response) => {


				let totalIrradiation = (response[7].length) ? response[7].reduce((acc, cur) => acc + parseFloat(cur)) : 0
				let totalProduction = (response[8].length) ? response[8].reduce((acc, cur) => acc + parseFloat(cur)) : 0

				let productionAverageValidatorIsNumber = (typeof parseFloat((totalProduction / response[8].length).toFixed(3)) == "number" && response[8].length > 0)
				let productionAverage = (productionAverageValidatorIsNumber) ? parseFloat((totalProduction / response[8].length).toFixed(3)) : 0

				let irradiationAverageIsNumber = (typeof parseFloat((totalIrradiation / response[7].length).toFixed(3)) == "number" && response[7].length > 0)
				let irradiationAverage = (irradiationAverageIsNumber) ? parseFloat((totalIrradiation / response[7].length).toFixed(3)) : 0
				let higherIrradiation = max(response[7])

				let painelEfficiencyDegree = 0.175

				let nominalProductionIsNumber = (typeof parseFloat((irradiationAverage * painelEfficiencyDegree).toFixed(3)) == "number" && irradiationAverage * painelEfficiencyDegree	!= 0)
				let nominalProduction = (nominalProductionIsNumber) ? parseFloat((irradiationAverage * painelEfficiencyDegree).toFixed(3)) : 1

				let performanceRatioIsNumber = (typeof parseFloat((productionAverage / nominalProduction).toFixed(2)) == "number")
				let performanceRatio = (performanceRatioIsNumber) ? parseFloat((productionAverage / nominalProduction).toFixed(2)) : 0

				let items = {
					period: 'day',
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					averages: response[0],
					interval: response[1],
					irradiation: response[7],
					higherIrradiation,
					irradiationQuarters: response[9],
					irradiationAverages: response[12],
					capacityFactor: response[2],
					alternateCurrent: response[3],
					alternateTension: response[5],
					continuousCurrent: response[4],
					continuousTension: response[6],
					completeInterval: response[10],
					completeIrradiation: response[11],
					totalProduction,
					totalIrradiation,
					performanceRatio,
					productionAverage,
					nominalProduction,
					irradiationAverage,
					painelEfficiencyDegree,
					monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				}

				resolve(items)

			})
			.catch((err) => {
				reject(err)
			})

	})
}

CampoGrandeProductionServices.readForOneMonth = async (date) => {

	let items = {}
	let monthInterval = []
	let averageProduction = []
	let averageCapacityFactor = []
	let totalProductions = []
	let performances = []

	let dateToRequest = {
		month:
			date[4] +
			date[5],
		year:
			date[0] +
			date[1] +
			date[2] +
			date[3]
	}

	let daysThisMonth = daysInMonthDefiner.howManyDaysThisMonth(dateToRequest.month)
	let days = []

	for (let i = 1; i <= daysThisMonth; i++) {
		days.push((i < 10) ? "0" + i : i)
	}

	return new Promise((resolve, reject) => {
		days.map(day => {
			CampoGrandeProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day)
				.then((response) => {

					let effectiveHours = response.interval.length / 4

					let totalAverage = (response.averages.length) ? response.averages.reduce((acc, cur) => acc + cur) : 0
					let totalCapacityFactor = (response.capacityFactor.length) ? response.capacityFactor.reduce((acc, cur) => acc + cur) : 0
					let totalProduction = parseFloat((response.totalProduction).toFixed(3)) || 0
					let performanceRatioIsNumber = (typeof response.performanceRatio == "number")
					let performanceRatio = (performanceRatioIsNumber) ? response.performanceRatio : 0

					averageProduction[day - 1] = (dateToRequest.year === "2018" || (dateToRequest.year === "2019" && dateToRequest.month < 7)) ? parseFloat((totalAverage).toFixed(3)) || 0 : parseFloat((totalAverage / 4).toFixed(3)) || 0
					
					averageProduction[day - 1] = (averageProduction[day - 1] > 65) ? parseFloat((totalAverage / 2).toFixed(3)) || 0 : averageProduction[day - 1]
					
					// Second verification
					averageProduction[day - 1] = (averageProduction[day - 1] > 70) ? parseFloat((averageProduction[day - 1] / 2).toFixed(3)) || 0 : averageProduction[day - 1]
					
					averageCapacityFactor[day - 1] = parseFloat((totalCapacityFactor / effectiveHours).toFixed(3)) || 0
					totalProductions[day - 1] = totalProduction
					performances[day - 1] = performanceRatio

					monthInterval.push(day)
					monthInterval.sort()

					if (monthInterval.length == days.length) {

						let maxCapacityFactor = max(averageCapacityFactor);
						let normalizedCapacityFactor = []
						
						averageCapacityFactor.map(item => {
							let normalized = normalize(1, maxCapacityFactor, item);
							normalizedCapacityFactor.push(normalized);
						})

						let totalPerformanceRatio = performances.reduce((acc, cur) => acc + parseFloat(cur)) || 0

						let effectivePerformanceDays = performances.filter((effectiveDay) => { return effectiveDay > 0 })
						let totalPerformanceRatioAverage = totalPerformanceRatio / effectivePerformanceDays.length
						let totalPerformanceRatioComparison = [
							parseFloat((totalPerformanceRatioAverage).toFixed(2)),
							parseFloat((100 - totalPerformanceRatioAverage).toFixed(2))
						]

						items = {
							averages: averageProduction,
							capacityFactor: normalizedCapacityFactor,
							productions: totalProductions,
							performances: performances,
							performanceRatioComparison: totalPerformanceRatioComparison,
							interval: monthInterval,
							monthDay: dateToRequest.month + "/" + dateToRequest.year,
							month: dateToRequest.month,
							year: dateToRequest.year,
							period: 'month'
						}

						resolve(items)
					}

				})
				.catch((err) => {

					let items = {
						err,
						averages: [0],
						capacityFactor: [0],
						productions: [0],
						performances: [0],
						performanceRatioComparison: [0],
						interval: [0],
						monthDay: dateToRequest.month + "/" + dateToRequest.year,
						month: dateToRequest.month,
						year: dateToRequest.year,
						period: 'month'
					}
					
					resolve(items)

				})
		})

	})

}

CampoGrandeProductionServices.readForOneYear = async (date) => {

	let averageProductions = []
	let capacityFactorAverages = []
	let higherAverages = []
	let higherAverageDays = []
	let performancesAverages = []
	let totalProductionAverages = []
	let productionsSum = []
	let yearInterval = []

	let dateToRequest = {
		year: date[0] + date[1] + date[2] + date[3],
		month: date[4] + date[5],
		day: date[6] + date[7]
	}

	return new Promise ((resolve, reject) => {
		let params = tableDefiner.defineTable
			(
				'campo-grande',
				'production-year',
				null,
				dateToRequest.day,
				dateToRequest.month,
				dateToRequest.year,
				null
			)

		docClient.query(params, (err, data) => {
			if (err) {
				console.log(err);
				resolve({ err })
			} else {
				data.Items.forEach(item => {
					if (typeof data.Items != 'undefined') {
						let averageProduction = parseFloat((item.averageProduction).toFixed(3))
						let capacityFactorAverage = parseFloat((item.capacityFactorAverage).toFixed(3))
						let higherAverage = parseFloat((item.higherAverage).toFixed(3))
						let performancesAverage = parseFloat((item.performancesAverage).toFixed(3))
						let totalProductionAverage = parseFloat((item.totalProductionAverage).toFixed(3))
						let productionsSumUnit = parseFloat((item.productionsSum).toFixed(3))
						let { higherAverageDay } = item
						let { mes } = item

						averageProductions.push(averageProduction)
						capacityFactorAverages.push(capacityFactorAverage)
						higherAverages.push(higherAverage)
						higherAverageDays.push(higherAverageDay)
						performancesAverages.push(performancesAverage)
						totalProductionAverages.push(totalProductionAverage)
						productionsSum.push(productionsSumUnit)
						yearInterval.push(mes)
					}
				})

				let items = {
					averageProductions,
					capacityFactorAverages,
					higherAverages,
					higherAverageDays,
					performancesAverages,
					totalProductionAverages,
					productionsSum,
					yearInterval,
					year: dateToRequest.year,
					period: "year"
				}

				resolve(items)

			}
		})	

	})

}

module.exports = { CampoGrandeProductionServices }