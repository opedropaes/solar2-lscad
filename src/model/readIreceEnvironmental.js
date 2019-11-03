/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')
const daysInMonthDefiner = require('../utils/daysInMonthDefiner')

const docClient = AWSConfig.docClient

const requireAWSData = async (params) => {
	return new Promise((resolve, reject) => {

		let items = []
		let interval = []
		let humidity = [] 
		let rainfall = []
		let windSpeed = [] 
		let temperature = []
		let atmPressure = []
		let solarRadiation = []
		let averageRadiation = []

		docClient.query(params, (err, data) => {
			if (err) {
				reject('Unable to scan table. Error JSON: ' + JSON.stringify(err, null, 2))
			}
			else {
				let qtd = 0
				data.Items.forEach(function (item) {
					if (typeof data.Items != 'undefined') {

						if (item.avg_radsol_I > 0) {

							let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)

							let windSpeed = parseFloat(item.vel_vento).toFixed(2)
							let humidity = parseFloat(item.umi_ar_avg).toFixed(2)
							let temperature = parseFloat(item.temp_ar_avg).toFixed(2)
							let rainfall = parseFloat(item.prec_chuva_tot).toFixed(2)
							let atmPressure = parseFloat(item.press_atm_avg).toFixed(2)
							let solarRadiation = parseFloat(item.avg_radsol_I).toFixed(3)
							let averageRadiation = parseFloat(item.irradiancia_avg).toFixed(3)

							items.push({
								humidity: humidity,
								rainfall: rainfall,
								windSpeed: windSpeed,
								atmPressure: atmPressure,
								temperature: temperature,
								date: formatedDate.hourMin,
								solarRadiation: solarRadiation,
								averageRadiation: averageRadiation,
							})

							interval.push(formatedDate.hourMin)
							qtd++
						}

					}

				})

				interval.sort()

				for (let hour of interval) {
					for (let item of items) {
						if (hour == item.date) {
							humidity.push(parseFloat(item.humidity))
							rainfall.push(parseFloat(item.rainfall))
							windSpeed.push(parseFloat(item.windSpeed))
							temperature.push(parseFloat(item.temperature))
							atmPressure.push(parseFloat(item.atmPressure))
							solarRadiation.push(parseFloat(item.solarRadiation))
							averageRadiation.push(parseFloat(item.averageRadiation))

						}
					}
				}

			}

			resolve([
				interval,
				humidity,
				rainfall,
				windSpeed,
				temperature,
				atmPressure,
				solarRadiation,
				averageRadiation,
			])

		})
	})
}

IreceEnvironmentalServices = {}

IreceEnvironmentalServices.readForOneDay = async (date) => {

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
                'irece',
                'environmental',
                null,
                dateToRequest.day,
                dateToRequest.month,
                dateToRequest.year,
                null
            )
		
		requireAWSData(params)
		.then((response) => {

			//irradiation

			let irradiation = response[7]
			let irradiationExists = irradiation.length

			let totalIrradiation = (irradiationExists) ? irradiation.reduce((acc, cur) => acc + parseFloat(cur)) : 0
			let averageIrradiation = (irradiationExists) ? totalIrradiation / irradiation.length : 0

			let higherIrradiation = 0

			irradiation.map(item => {
				if (item > higherIrradiation)
					higherIrradiation = item
			})

			if (higherIrradiation === 0) 
				higherIrradiation = undefined

			//temperature

			let temperature = response[4]
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

			//rainfall

			let rainfall = response[2]
			let accumulateRainfall = 0

			for (let i = 0; i < rainfall.length; i++) {
				if (rainfall[i] != rainfall[i + 1]) {
					accumulateRainfall += parseFloat(rainfall[i] / 1000)
				}
			}

			//wind speed

			let windSpeed = response[3]
			let windSpeedExists = windSpeed.length

			let totalWindSpeed = (windSpeedExists) ? windSpeed.reduce((acc, cur) => acc + parseFloat(cur)) : 0
			let averageWindSpeed = (windSpeedExists) ? totalWindSpeed / windSpeed.length : 0

			let items = {
				humidity: response[1],
				accumulateRainfall: parseFloat((accumulateRainfall).toFixed(2)),
				rainfall: response[2],
				windSpeed: response[3],
				averageWindSpeed: parseFloat((averageWindSpeed).toFixed(2)),
				temperature: response[4],
				atmPressure: response[5],
				solarRadiation: response[6],
				averageRadiation: response[7],
				averageIrradiation: parseFloat((averageIrradiation).toFixed(2)),
				higherIrradiation: parseFloat((higherIrradiation).toFixed(3)),
				averageTemperature: parseFloat((averageTemperature).toFixed(1)),
				higherTemperature: parseFloat((higherTemperature).toFixed(1)),
				lowerTemperature: parseFloat((lowerTemperature).toFixed(1)),
				interval: response[0],
				day: dateToRequest.day,
                month: dateToRequest.month,
				year: dateToRequest.year,
				monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				period: 'day'
			}

			resolve(items)

		})
		.catch((err) => {

			let items = {
				err,
				humidity: [0],
				accumulateRainfall: 0,
				rainfall: [0],
				windSpeed: [0],
				averageWindSpeed: 0,
				temperature: [0],
				atmPressure: [0],
				solarRadiation: [0],
				averageRadiation: [0],
				averageIrradiation: 0,
				higherIrradiation: 0,
				averageTemperature: 0,
				higherTemperature: 0,
				lowerTemperature: 0,
				interval: [0],
				day: dateToRequest.day,
                month: dateToRequest.month,
				year: dateToRequest.year,
				monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				period: 'day'
			}

			resolve(items)
			
		})

	})

}

IreceEnvironmentalServices.readForOneMonth = async (date) => {

	let items = {}
	let monthInterval = []
	let averageIrradiations = []
	let higherIrradiations = []
	let averageTemperatures = []
	let higherTemperatures = []
	let lowerTemperatures = []
	let accumulateRainfall = []
	let averageWindSpeeds = []

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
			IreceEnvironmentalServices.readForOneDay(dateToRequest.year + dateToRequest.month + day)
				.then((response) => {

					monthInterval.push(day)
					monthInterval.sort()

					averageIrradiations[day - 1] = response.averageIrradiation
					higherIrradiations[day - 1] = response.higherIrradiation
					averageTemperatures[day - 1] = response.averageTemperature
					higherTemperatures[day - 1] = response.higherTemperature
					lowerTemperatures[day - 1] = response.lowerTemperature
					accumulateRainfall[day - 1] = response.accumulateRainfall
					averageWindSpeeds[day - 1] = response.averageWindSpeed

					if (monthInterval.length === days.length) {

						items = {
							monthInterval,
							averageIrradiations,
							higherIrradiations,
							averageTemperatures,
							higherTemperatures,
							lowerTemperatures,
							accumulateRainfall,
							averageWindSpeeds,
							period: 'month',
							month: dateToRequest.month,
							year: dateToRequest.year,
							monthDay: dateToRequest.month + '/' + dateToRequest.year,
						}
						resolve(items)

					}
					
				})
				.catch((err) => {

					items = {
						err,
						monthInterval,
						averageIrradiations,
						higherIrradiations,
						averageTemperatures,
						higherTemperatures,
						lowerTemperatures,
						accumulateRainfall,
						averageWindSpeeds,
						period: 'month',
						month: dateToRequest.month,
						year: dateToRequest.year,
						monthDay: dateToRequest.month + '/' + dateToRequest.year,
					}
					resolve(items)

				})
		})

	})

}

IreceEnvironmentalServices.readForOneYear = async (date) => {

	let irradiations = []
	let rainfalls = []
	let temperatures = []
	let windSpeeds = []
	let yearInterval = []

	let dateToRequest = {
		year: date[0] + date[1] + date[2] + date[3],
		month: date[4] + date[5],
		day: date[6] + date[7]
	}

	return new Promise((resolve, reject) => {
		let params = tableDefiner.defineTable
			(
				'irece',
				'environmental-year',
				null,
				dateToRequest.day,
				dateToRequest.month,
				dateToRequest.year,
				null
			)
		let year = dateToRequest.year

		docClient.query(params, (err, data) => {
			if (err) {
				console.log(err);
				resolve({ err })
			} else {
				data.Items.forEach(item => {
					if (typeof data.Items != 'undefined') {

						let { ano, mes, irradiation, temperature, windSpeed, rainfall } = item

						yearInterval.push(mes)
						irradiations.push(irradiation)
						temperatures.push(temperature)
						windSpeeds.push(windSpeed)
						rainfalls.push(rainfall)
						year = ano

					}
				})

				let items = {
					yearInterval,
					irradiations,
					temperatures,
					windSpeeds,
					rainfalls,
					year,
					period: "year"
				}

				resolve(items)

			}
		})

	})

}

module.exports = { IreceEnvironmentalServices }