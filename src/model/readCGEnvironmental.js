const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')
const irradiationReader = require('./readCGProduction').CampoGrandeProductionServices

const docClient = AWSConfig.docClient;

let now = new Date

const requireAWSData = async (params) => {
	return new Promise((resolve, reject) => {

		let items = []
		let interval = []
		let sortedItems = []
		let PM1Particulates = []
		let PM10Particulates =[]
		let PM2Particulates = []
		let PM4Particulates = []
		let PM1Numbers = []
		let PM10Numbers = []
		let PM2Numbers = []
		let PM4Numbers = []
		let averageSizes = []
		let temperatures = []
		let types = []
		let windDirections = []
		let windSpeeds = []
		

		docClient.query(params, (err, data) => {
			if (err) {
				reject("Unable to scan table. Error JSON: " + JSON.stringify(err, null, 2))
			}
			else {
				let qtd = 0
				data.Items.forEach(function (item) {
					if (typeof data.Items != "undefined") {

						let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)

						let massaPM1 = item.massaPM1
						let massaPM2 = item.massaPM2
						let massaPM4 = item.massaPM4
						let massaPM10 = item.massaPM10
						let numPM1 = item.numPM1
						let numPM2 = item.numPM2
						let numPM4 = item.numPM4
						let numPM10 = item.numPM10
						let averageSize = item.tamanho_medio
						let temperature = item.temp
						let type = item.tipo
						let windDir = item.vento_dir
						let windSpeed = item.ventor_vel

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
			])

		})
	})
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
					PM1Particulates:  response[1],
					PM2Particulates:  response[2],
					PM4Particulates:  response[3],
					PM10Particulates:  response[4],
					PM1Numbers:  response[5],
					PM2Numbers:  response[6],
					PM4Numbers:  response[7],
					PM10Numbers:  response[8],
					averageSizes:  response[9],
					temperatures:  response[10],
					types:  response[11],
					windDirections:  response[12],
					windSpeeds:  response[13],
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					monthDay: dateToRequest.day + '/' + dateToRequest.month + '/' + dateToRequest.year,
				}

				resolve(items)
			})
			.catch((err) => {
				reject(err)
			})

	})

	let promiseIrr = new Promise((resolve, reject) => {
		irradiationReader.readForOneDay(dateToRequest.year + dateToRequest.day + dateToRequest.month)
			.then(response => {
				console.log(response)
				resolve({ irradiation: response.irradiation })
			})
			.catch(err => {
				console.log(err)
			})
	})

	return Promise.all([promiseIrr, promiseEnv])
}

module.exports = { CampoGrandeEnvironmentalServices }