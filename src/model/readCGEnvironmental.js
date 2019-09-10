const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')
const irradiationReader = require('./readCGProduction').CampoGrandeProductionServices

const docClient = AWSConfig.docClient;

const requireAWSData = async (params) => {
	return new Promise((resolve, reject) => {

		let items = []
		let types = []
		let interval = []
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
						let windDir = item.vento_dir
						let massaPM1 = item.massaPM1
						let massaPM2 = item.massaPM2
						let massaPM4 = item.massaPM4
						let massaPM10 = item.massaPM10
						let windSpeed = item.ventor_vel
						let averageSize = item.tamanho_medio

						items.push({
							date: formatedDate.hourMin,
							massaPM1,
							massaPM2,
							massaPM4,
							massaPM10,
							numPM1,
							numPM2,
							numPM4,
							numPM10,
							averageSize,
							temperature,
							type,
							windDir,
							windSpeed
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
				quarters.interval
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

				let items = {
					interval: response[0],
					PM1Particulates: response[1],
					PM2Particulates: response[2],
					PM4Particulates: response[3],
					PM10Particulates: response[4],
					PM1Numbers: response[5],
					PM2Numbers: response[6],
					PM4Numbers: response[7],
					PM10Numbers: response[8],
					averageSizes: response[9],
					temperatures: response[10],
					types: response[11],
					windDirections: response[12],
					windSpeeds: response[13],
					PM1NumbersQuarters: response[14],
					PM2NumbersQuarters: response[15],
					PM4NumbersQuarters: response[16],
					PM10NumbersQuarters: response[17],
					PM1ParticulatesQuarters: response[18],
					PM2ParticulatesQuarters: response[19],
					PM4ParticulatesQuarters: response[20],
					PM10ParticulatesQuarters: response[21],
					averageSizesQuarters: response[22],
					quartersInterval: response[23],
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				}

				resolve(items)
			})
			.catch((err) => {
				let items = {
					interval: [0],
					PM1Particulates: [0],
					PM2Particulates: [0],
					PM4Particulates: [0],
					PM10Particulates: [0],
					PM1Numbers: [0],
					PM2Numbers: [0],
					PM4Numbers: [0],
					PM10Numbers: [0],
					averageSizes: [0],
					temperatures: [0],
					types: [0],
					windDirections: [0],
					windSpeeds: [0],
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
				resolve({ 
					irradiation: response.irradiationQuarters,
					interval: response.interval,
					completeIrradiation: response.completeIrradiation,
					completeInterval: response.completeInterval
				})
			})
			.catch(err => {
				resolve({
					irradiation: [0],
					interval: [0],
					completeIrradiation: [0],
					completeInterval: [0]
				})
			})
	})

	return Promise.all([promiseIrr, promiseEnv])
}

module.exports = { CampoGrandeEnvironmentalServices }