const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')
const irradiationReader = require('./readCGProduction').CampoGrandeProductionServices
const daysInMonthDefiner = require('../utils/daysInMonthDefiner')
const windDirectionConverter = require('./wind-direction-converter')

const docClient = AWSConfig.docClient;

const requireAWSData = async (params) => {
	return new Promise((resolve, reject) => {

		let items = []
		let types = []
		let interval = []
		let humidities = []
		let PM1Numbers = []
		let PM2Numbers = []
		let PM4Numbers = []
		let windSpeeds = []
		let PM10Numbers = []
		let averageSizes = []
		let temperatures = []
		let windDirections = []
		let PM1Particulates = []
		let PM2Particulates = []
		let PM4Particulates = []
		let PM10Particulates = []


		docClient.query(params, (err, data) => {
			if (err) {
				reject("Unable to scan table. Error JSON: " + JSON.stringify(err, null, 2))
			}
			else {
				let qtd = 0

				data.Items.forEach(function (item) {
					if (typeof data.Items != "undefined") {

						//if (item.hora_minuto >= 60000 && item.hora_minuto <= 190000) {
						let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)

						let type = item.tipo
						let numPM1 = item.numPM1
						let numPM2 = item.numPM2
						let numPM4 = item.numPM4
						let numPM10 = item.numPM10
						let temperature = item.temp
						let windDir = windDirectionConverter.convert(item.vento_dir)
						let massaPM1 = item.massaPM1
						let massaPM2 = item.massaPM2
						let massaPM4 = item.massaPM4
						let massaPM10 = item.massaPM10
						let windSpeed = item.ventor_vel
						let averageSize = item.tamanho_medio
						let humidity = item.hum

						items.push({
							date: formatedDate.hourMin,
							massaPM1: massaPM1 || 0,
							massaPM2: massaPM2 || 0,
							massaPM4: massaPM4 || 0,
							massaPM10: massaPM10 || 0,
							numPM1: numPM1 || 0,
							numPM2: numPM2 || 0,
							numPM4: numPM4 || 0,
							numPM10: numPM10 || 0,
							averageSize: averageSize || 0,
							temperature: temperature || 0,
							type: type || "null",
							windDir: windDir || 0,
							windSpeed: windSpeed || 0,
							humidity: humidity || 0
						})

						interval.push(formatedDate.hourMin)
						qtd++
						//}

					}

				})

				interval.sort()

				for (let hour of interval) {
					for (let item of items) {
						if (hour == item.date) {
							PM1Particulates.push(item.massaPM1)
							PM2Particulates.push(item.massaPM2)
							PM4Particulates.push(item.massaPM4)
							PM10Particulates.push(item.massaPM10)
							PM1Numbers.push(item.numPM1)
							PM2Numbers.push(item.numPM2)
							PM4Numbers.push(item.numPM4)
							PM10Numbers.push(item.numPM10)
							averageSizes.push(item.averageSize)
							temperatures.push(item.temperature)
							types.push(item.type)
							windDirections.push(item.windDir)
							windSpeeds.push(item.windSpeed)
							humidities.push(item.humidity)
						}
					}
				}

			}

			let datesToGetQuarter = {
				PM1Particulates,
				PM2Particulates,
				PM4Particulates,
				PM10Particulates,
				PM1Numbers,
				PM2Numbers,
				PM4Numbers,
				PM10Numbers,
				averageSizes
			}

			let quarters = getQuarterValues(datesToGetQuarter, interval)

			resolve([
				interval,
				PM1Particulates,
				PM2Particulates,
				PM4Particulates,
				PM10Particulates,
				PM1Numbers,
				PM2Numbers,
				PM4Numbers,
				PM10Numbers,
				averageSizes,
				temperatures,
				types,
				windDirections,
				windSpeeds,
				quarters.PM1Numbers,
				quarters.PM2Numbers,
				quarters.PM4Numbers,
				quarters.PM10Numbers,
				quarters.PM1Particulates,
				quarters.PM2Particulates,
				quarters.PM4Particulates,
				quarters.PM10Particulates,
				quarters.averageSizes,
				quarters.interval,
				humidities
			])

		})
	})
}

const getQuarterValues = (data, dates) => {

	try {

		let PM1Numbers = []
		let PM2Numbers = []
		let PM4Numbers = []
		let PM10Numbers = []
		let averageSizes = []
		let PM1Particulates = []
		let PM2Particulates = []
		let PM4Particulates = []
		let PM10Particulates = []
		let interval = []

		for (let i = 0; i < dates.length; i++) {

			let minute = dates[i][3] + dates[i][4]

			if (minute % 10 == 0) {

				interval.push(dates[i])
				PM1Numbers.push(data.PM1Numbers[i])
				PM2Numbers.push(data.PM2Numbers[i])
				PM4Numbers.push(data.PM4Numbers[i])
				PM10Numbers.push(data.PM10Numbers[i])
				averageSizes.push(data.averageSizes[i])
				PM1Particulates.push(data.PM1Particulates[i])
				PM2Particulates.push(data.PM2Particulates[i])
				PM4Particulates.push(data.PM4Particulates[i])
				PM10Particulates.push(data.PM10Particulates[i])

			}

		}

		return {
			PM1Numbers,
			PM2Numbers,
			PM4Numbers,
			PM10Numbers,
			averageSizes,
			PM1Particulates,
			PM2Particulates,
			PM4Particulates,
			PM10Particulates,
			interval
		}

	} catch (error) {
		return error
	}

}

CampoGrandeEnvironmentalServices = {}

CampoGrandeEnvironmentalServices.readForOneDay = async (date) => {

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

	let promiseEnv = new Promise((resolve, reject) => {

		let params = tableDefiner.defineTable(
			'campo-grande',
			'environmental',
			null,
			dateToRequest.day,
			dateToRequest.month,
			dateToRequest.year,
			null
		)

		requireAWSData(params)
			.then((response) => {

				//Temperatura

				let temperature = response[10]
				let temperatureExists = (!isNaN(temperature.length))

				let totalTemperature = 0
				let higherTemperature = 0
				let lowerTemperature = 100

				temperature.map(item => {
					totalTemperature += parseFloat(item)
					if (item < lowerTemperature && item != 0)
						lowerTemperature = item
					if (item > higherTemperature)
						higherTemperature = item
				})

				if (lowerTemperature === 100)
					lowerTemperature = undefined
				
				if (higherTemperature === 0)
					higherTemperature = undefined

				let averageTemperature = totalTemperature / ((temperatureExists) ? temperature.length : 1)

				//Umidade

				let humidity = response[24]
				let totalHumidity = 0

				for (let i = 0; i < humidity.length; i++) {
					if (humidity[i] != humidity[i + 1]) {
						totalHumidity += parseFloat(humidity[i] / 1000)
					}
				}

				//Velocidade do vento

				let windSpeed = response[13]
				let windSpeedExists = (!isNaN(windSpeed))

				let totalWindspeed = 0

				windSpeed.map(item => {
					totalWindspeed = parseFloat(item)
				})

				let averageWindSpeed = totalWindspeed / ((windSpeedExists) ? windSpeed.length : 1)

				//Particulados PM1

				let pm1 = response[1]
				let pm1Exists = (!isNaN(pm1.length))
				let totalPM1 = 0

				pm1.map(item => {
					totalPM1 += parseFloat(item)
				})

				let averagePM1 = totalPM1 / ((pm1Exists) ? pm1.length : 1)

				//Particulados PM2

				let pm2 = response[2]
				let pm2Exists = (!isNaN(pm2.length))
				let totalPM2 = 0

				pm2.map(item => {
					totalPM2 += parseFloat(item)
				})

				let averagePM2 = totalPM2 / ((pm2Exists) ? pm2.length : 1)

				let items = {
					period: "day",
					interval: (response[0].length) ? response[0] : [0],
					PM1Particulates: (response[1].length) ? response[1] : [0],
					averagePM1: parseFloat((averagePM1).toFixed(2)),
					totalPM1: parseFloat((totalPM1).toFixed(2)),
					PM2Particulates: (response[2].length) ? response[2] : [0],
					averagePM2: parseFloat((averagePM2).toFixed(2)),
					totalPM2: parseFloat((totalPM2).toFixed(2)),
					PM4Particulates: (response[3].length) ? response[3] : [0],
					PM10Particulates: (response[4].length) ? response[4] : [0],
					PM1Numbers: (response[5].length) ? response[5] : [0],
					PM2Numbers: (response[6].length) ? response[6] : [0],
					PM4Numbers: (response[7].length) ? response[7] : [0],
					PM10Numbers: (response[8].length) ? response[8] : [0],
					averageSizes: (response[9].length) ? response[9] : [0],
					temperatures: (response[10].length) ? response[10] : [0],
					averageTemperature: parseFloat((averageTemperature).toFixed(2)),
					lowerTemperature,
					higherTemperature,
					types: (response[11].length) ? response[11] : [0],
					windDirections: (response[12].length) ? response[12] : [0],
					windSpeeds: (response[13].length) ? response[13] : [0],
					averageWindSpeed,
					PM1NumbersQuarters: (response[14].length) ? response[14] : [0],
					PM2NumbersQuarters: (response[15].length) ? response[15] : [0],
					PM4NumbersQuarters: (response[16].length) ? response[16] : [0],
					PM10NumbersQuarters: (response[17].length) ? response[17] : [0],
					PM1ParticulatesQuarters: (response[18].length) ? response[18] : [0],
					PM2ParticulatesQuarters: (response[19].length) ? response[19] : [0],
					PM4ParticulatesQuarters: (response[20].length) ? response[20] : [0],
					PM10ParticulatesQuarters: (response[21].length) ? response[21] : [0],
					averageSizesQuarters: (response[22].length) ? response[22] : [0],
					quartersInterval: (response[23].length) ? response[23] : [0],
					humidity: (response[24].length) ? response[24] : [0],
					accumulateHumidity: parseFloat((totalHumidity).toFixed(2)),
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				}

				resolve(items)
			})
			.catch((err) => {

				console.log(err)

				let items = {
					period: "day",
					interval: [0],
					PM1Particulates: [0],
					averagePM1: 0,
					PM2Particulates: [0],
					averagePM2: 0,
					PM4Particulates: [0],
					PM10Particulates: [0],
					PM1Numbers: [0],
					PM2Numbers: [0],
					PM4Numbers: [0],
					PM10Numbers: [0],
					averageSizes: [0],
					temperatures: [0],
					averageTemperature: 0,
					lowerTemperature: 0,
					higherTemperature: 0,
					types: [0],
					windDirections: [0],
					windSpeeds: [0],
					averageWindSpeed: 0,
					PM1NumbersQuarters: [0],
					PM2NumbersQuarters: [0],
					PM4NumbersQuarters: [0],
					PM10NumbersQuarters: [0],
					PM1ParticulatesQuarters: [0],
					PM2ParticulatesQuarters: [0],
					PM4ParticulatesQuarters: [0],
					PM10ParticulatesQuarters: [0],
					averageSizesQuarters: [0],
					quartersInterval: [0],
					humidity: [0],
					accumulateHumidity: 0,
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				}

				resolve(items)
			})

	})

	let promiseIrr = new Promise((resolve, reject) => {
		irradiationReader.readForOneDay(dateToRequest.year + dateToRequest.month + dateToRequest.day)
			.then(response => {

				let { irradiationAverages, interval, completeIrradiation, completeInterval } = response

				let totalIrradiation = 0
				let higherIrradiation = 0

				irradiationAverages.map((item) => {
					totalIrradiation += (item * 1000)
					if (item > higherIrradiation) {
						higherIrradiation = item
					}
				})

				let averageIrradiation = totalIrradiation / ((irradiationAverages.length) ? irradiationAverages.length : 1)

				resolve({
					irradiation: irradiationAverages,
					interval: interval,
					completeIrradiation: completeIrradiation,
					completeInterval: completeInterval,
					accumulateIrradiation: totalIrradiation,
					averageIrradiation: parseFloat((averageIrradiation).toFixed(2)),
					higherIrradiation: parseFloat(higherIrradiation * 1000)

				})
			})
			.catch(err => {
				resolve({
					irradiation: [0],
					interval: [0],
					completeIrradiation: [0],
					completeInterval: [0],
					accumulateIrradiation: 0,
					averageIrradiation: 0,
					higherIrradiation: 0
				})
			})
	})

	return Promise.all([promiseIrr, promiseEnv])
}

CampoGrandeEnvironmentalServices.readForOneMonth = async (date) => {

	let items = {}
	let monthInterval = []
	let averageIrradiations = []
	let higherIrradiations = []
	let averageTemperatures = []
	let higherTemperatures = []
	let lowerTemperatures = []
	let accumulateHumidities = []
	let averageWindSpeeds = []
	let accumulatePM1 = []
	let averagesPM1 = []
	let accumulatePM2 = []
	let averagesPM2 = []

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

	let daysThisMonth = daysInMonthDefiner.howMayDaysThisMonth(dateToRequest.month)
	let days = []

	for (let i = 1; i <= daysThisMonth; i++) {
		days.push((i < 10) ? "0" + i : i)
	}

	return new Promise((resolve, reject) => {
		days.map(day => {
			CampoGrandeEnvironmentalServices.readForOneDay(dateToRequest.year + dateToRequest.month + day)
				.then(response => {

					monthInterval.push(day)
					monthInterval.sort()

					averageIrradiations[day - 1] = response[0].averageIrradiation
					higherIrradiations[day - 1] = response[0].higherIrradiation
					averageTemperatures[day - 1] = response[1].averageTemperature
					higherTemperatures[day - 1] = response[1].higherTemperature
					lowerTemperatures[day - 1] = response[1].lowerTemperature
					accumulateHumidities[day - 1] = response[1].accumulateHumidity
					averageWindSpeeds[day - 1] = response[1].averageWindSpeed
					accumulatePM1[day - 1] = response[1].totalPM1
					averagesPM1[day - 1] = response[1].averagePM1
					accumulatePM2[day - 1] = response[1].totalPM2
					averagesPM2[day - 1] = response[1].averagePM2

					if (monthInterval.length === days.length) {

						items = {
							monthInterval,
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
							averagesPM2,
							month: dateToRequest.month,
							year: dateToRequest.year,
							monthDay: dateToRequest.month + '/' + dateToRequest.year,
							period: "month"
						}

						resolve(items)

					}


				})
				.catch(err => {

					console.log(err)

					items = {
						err,
						monthInterval: [0],
						averageIrradiations: [0],
						higherIrradiations: [0],
						averageTemperatures: [0],
						higherTemperatures: [0],
						lowerTemperatures: [0],
						accumulateHumidities: [0],
						averageWindSpeeds: [0],
						accumulatePM1: [0],
						averagesPM1: [0],
						accumulatePM2: [0],
						averagesPM2: [0],
						month: dateToRequest.month,
						year: dateToRequest.year,
						monthDay: dateToRequest.month + '/' + dateToRequest.year,
						period: "month"
					}

					resolve(items)

				})
		})
	})

}

const resolveMonthPromise = async (date) => {

	console.log(date, "date")

	CampoGrandeProductionServices.readForOneMonth(date)
		.then(response => {

			console.log(response)

			// let year = response.year;
			// let month = response.month;

			// // Irradiacao
			// // console.log(response.averageIrradiations)
			// // let totalAverageIrradiation = response.averageIrradiations.reduce((acc, cur) => acc + parseFloat(cur));
			// // let averageIrradiation = totalAverageIrradiation / response.averageIrradiations.length;
			
			// // let higherIrradiationValue = 0;
			// // let higherIrradiationDay = 0;

			// // response.higherIrradiations.map(item => {
			// // 	if (item > higherIrradiationValue) {
			// // 		higherIrradiationValue = item;
			// // 		higherIrradiationDay = response.higherIrradiations.indexOf(item) + 1;
			// // 	}
					
			// // });

			// // Temperatura

			// let totalTemperature = 0
			// response.averageTemperatures.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalTemperature += parseFloat(item);
			// 	}
			// });

			// let averageTemperature = totalTemperature / response.averageTemperatures.length;

			// let higherTemperatureValue = 0;
			// let higherTemperatureDay = 0;

			// response.higherTemperatures.map(item => {
			// 	if (item > higherTemperatureValue) {
			// 		higherTemperatureValue = item;
			// 		higherTemperatureDay = response.higherIrradiations.indexOf(item) + 1;
			// 	}

			// });

			// if (higherIrradiationValue === 0) {
			// 	higherIrradiationDay = "null";
			// 	higherIrradiationValue = "null";
			// }

			// let lowerTemperatureValue = 100;
			// let lowerTemperatureDay = 100;

			// response.lowerTemperatures.map(item => {
			// 	if (item < higherTemperatureValue) {
			// 		lowerTemperatureValue = item;
			// 		lowerTemperatureDay = response.lowerTemperatures.indexOf(item) + 1;
			// 	}

			// });

			// if (lowerTemperatureValue === 100) {
			// 	lowerTemperatureValue = "null";
			// 	lowerTemperatureDay = "null";
			// }

			// // Precipitação

			// let totalRainfall = 0
			// response.accumulateHumidities.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalRainfall += parseFloat(item);
			// 	}
			// });

			// let averageRainfall = totalRainfall / response.accumulateHumidities.length;

			// let mostRainfallDay = 0
			// let mostRainfall = 0
			
			// response.accumulateHumidities.map(item => {
			// 	if (item > mostRainfall) {
			// 		mostRainfall = item;
			// 		mostRainfallDay = response.accumulateHumidities.indexOf(item) + 1;
			// 	}
			// })

			// // Velocidade do vento

			// let totalWindSpeed = 0
			// response.averageWindSpeeds.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalWindSpeed += parseFloat(item);
			// 	}
			// });

			// let averageWindSpeed = totalWindspeed / response.averageWindSpeeds.length;

			// // PM1

			// let totalAccumulatePM1 = 0
			// response.accumulatePM1.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalAccumulatePM1 += item;
			// 	}
			// })

			// let averageAccumulatePM1 = totalAccumulatePM1 / response.accumulatePM1.length;

			// let totalAveragePM1 = 0
			// response.averagesPM1.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalAveragePM1 += item;
			// 	}
			// })

			// let averagePM1 = totalAveragePM1 / response.averagesPM1.length;

			// // PM2

			// let totalAccumulatePM2 = 0
			// response.accumulatePM2.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalAccumulatePM2 += item;
			// 	}
			// })

			// let averageAccumulatePM2 = totalAccumulatePM2 / response.accumulatePM2.length;

			// let totalAveragePM2 = 0
			// response.averagesPM2.map(item => {
			// 	if (typeof item === "number" && item >= 0) {
			// 		totalAveragePM2 += item;
			// 	}
			// })

			// let averagePM2 = totalAveragePM2 / response.averagesPM2.length;
			
			// let items = {
			// 	ano: year,
			// 	mes: month,
			// 	irradiacao: {
			// 		media: averageIrradiation,
			// 		maiorIrradiacao: higherIrradiationValue,
			// 		diaMaiorIrradiacao: higherIrradiationDay
			// 	},
			// 	temperatura: {
			// 		media: averageTemperature,
			// 		maiorTemperatura: higherTemperatureValue,
			// 		diaMaiorTemperatura: higherTemperatureDay,
			// 		menorTemperatura: lowerTemperatureValue,
			// 		diaMenorTemperatura: lowerTemperatureDay
			// 	},
			// 	precipitacao: {
			// 		acumulada: totalRainfall,
			// 		media: averageRainfall,
			// 		diaMaisChuva: mostRainfallDay,
			// 		quantidadeMaisChuva: mostRainfall
			// 	},
			// 	velVento: {
			// 		media: averageWindSpeed
			// 	},
			// 	PM1: {
			// 		mediaMassa: averageAccumulatePM1,
			// 		mediaConcentracao: averagePM1
			// 	},
			// 	PM2: {
			// 		mediaMassa: averageAccumulatePM2,
			// 		mediaConcentracao: averagePM2
			// 	}

			// };

			// console.log(items);

		})

}

resolveMonthPromise(20190901);

module.exports = { CampoGrandeEnvironmentalServices }