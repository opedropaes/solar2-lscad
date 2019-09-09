/* eslint-disable eqeqeq */
const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')

const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient

let now = new Date
let usedYear = now.getFullYear()
let usedMonth = now.getMonth() + 1
let usedDay = now.getDate()

const requireAWSData = async (params) => {
	return new Promise((resolve, reject) => {

		let items = []
		let interval = []
		let sortedItems = []

		docClient.query(params, (err, data) => {
			if (err) {
				reject('Unable to scan table. Error JSON: ' + JSON.stringify(err, null, 2))
			}
			else {

				data.Items.forEach(function (item) {
					if (typeof data.Items != 'undefined') {
						if (item.hora_minuto >= 60000 && item.hora_minuto <= 190000) {
                            
							if (item.P_AC >= 20) {

								let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)

								items.push({
									pac: item.P_AC / 1000,
									iac: item.I_AC,
									idc: item.I_DC,
									vac: item.V_AC,
									vdc: item.V_DC,
									irr: item.IRR || 0,
									hour: formatedDate.hour,
									minutes: formatedDate.min,
									hourMin: formatedDate.hourMin
								})

								interval.push(formatedDate.hourMin)
							}
						}
					}

				})

				interval.sort()

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
				response.irradiationQuarters
			])

		})
	})
}

const dataAverage = (data, dates) => {

	try {
		let minutesSum = 0
		let qtd = 0

		let capacityFactor = []
		let interval = []
		let averages = []
		let alternateCurrent = []
		let continuousCurrent = []
		let alternateTension = []
		let continuousTension = []
		let irradiation = []
		let totalProduction = []
		let irradiationQuarters = []

		for (let i = 0; i < dates.length; i++) {

			totalProduction.push(parseFloat(data[i].pac))
			irradiation.push(data[i].irr)
			
			let minute = dates[i][3] + dates[i][4]

			minutesSum += parseFloat(data[i].pac)
			qtd++

			if (minute % 15 == 0) {

				capacityFactor.push(parseFloat(((minutesSum / qtd) / 8.2).toFixed(3)))
				averages.push(parseFloat(parseFloat(minutesSum / qtd).toFixed(3)))
				alternateCurrent.push(data[i].iac)
				continuousCurrent.push(data[i].idc)
				alternateTension.push(data[i].vac)
				continuousTension.push(data[i].vdc)
				irradiationQuarters.push(data[i].irr)
				interval.push(dates[i])

				minutesSum = 0
				qtd = 0

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
			irradiationQuarters
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

		requireAWSData(params)
			.then((response) => {

				const totalIrradiation = response[7].reduce(
					(accumulator, currentValue) => accumulator + currentValue
				)

				const totalProduction = response[8].reduce(
					(accumulator, currentValue) => accumulator + parseFloat(currentValue)
				)

				let productionAverage = parseFloat((totalProduction/response[8].length).toFixed(3))
				let irradiationAverage = parseFloat((totalIrradiation/response[7].length).toFixed(3))
				let painelEfficiencyDegree = 0.175
				let nominalProduction = parseFloat((irradiationAverage * painelEfficiencyDegree).toFixed(3))
				let performanceRatio = parseFloat((productionAverage / nominalProduction).toFixed(2))

				let items = {
					period: 'day',
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					averages: response[0],
					interval: response[1],
					irradiation: response[7],
					irradiationQuarters: response[9],
					capacityFactor: response[2],
					alternateCurrent: response[3],
					alternateTension: response[5],
					continuousCurrent: response[4],
					continuousTension: response[6],
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

module.exports = { CampoGrandeProductionServices }