/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')

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

			let items = {
				humidity: response[1],
				rainfall: response[2],
				windSpeed: response[3],
				temperature: response[4],
				atmPressure: response[5],
				solarRadiation: response[6],
				averageRadiation: response[7],
				interval: response[0],
				day: dateToRequest.day,
                month: dateToRequest.month,
				year: dateToRequest.year,
				monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
			}

			resolve(items)

		})
		.catch((err) => {

			let items = {
				humidity: [0],
				rainfall: [0],
				windSpeed: [0],
				temperature: [0],
				atmPressure: [0],
				solarRadiation: [0],
				averageRadiation: [0],
				interval: [0],
				day: dateToRequest.day,
                month: dateToRequest.month,
				year: dateToRequest.year,
				monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
			}

			resolve(items)
			
		})

	})

}

module.exports = { IreceEnvironmentalServices }