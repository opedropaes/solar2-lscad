const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const decimalFormater = require('./format-decimal')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient;

const requireAWSData = async (table, params) => {
	return new Promise((resolve, reject) => {

		let i = 0
		let items = []
		let hours = []
		let sortedItems = []

		docClient.query(params, (err, data) => {
			if (err) {
				reject(err)
			}
			else {
				data.Items.forEach((item) => {
					if (typeof data.Items != "undefined") {
						if (item.hora_minuto >= 60000 && item.hora_minuto <= 200000) {

							let formatedDate = dateFormater.formatDate(item.dia_mes_ano, item.hora_minuto)

							if (typeof item.P_AC == "number") {
								items[i] = {
									value: (item.P_AC / 1000),
									hour: formatedDate.hour,
									minutes: formatedDate.min,
									hourMinute: formatedDate.hourMin
								}
							}

							let exists = false

							for (let item of hours) {
								if (item == formatedDate.hourMin) {
									exists = true
									break
								}
							}

							if (!exists) {
								hours.push(formatedDate.hourMin)
							}

							i++;
						}
					}
				})

				hours.sort()

				for (let hour of hours) {
					for (let item of items) {
						if (hour == item.hourMinute) {
							sortedItems.push(item.value)
						}
					}
				}

			}

			resolve([sortedItems, hours])

		})
	})
}

IreceProductionServices = {}

IreceProductionServices.readForOneDay = async (date) => {

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

		let tables = [1, 2, 3, 4, 5]
		let prodSum = []
		let items = []
		let hours = []
		let tablesRead = 0

		tables.map(async table => {

			let params = tableDefiner.defineTable
				(
					'irece',
					'production',
					table,
					dateToRequest.day,
					dateToRequest.month,
					dateToRequest.year,
					null
				)

			let response = await requireAWSData(table, params)

			tablesRead++

			if (prodSum.length != 0) {
				for (let i = 0; i < prodSum.length; i++) {
					if (typeof response[0][i] == "number") {
						prodSum[i] += parseFloat(response[0][i])
					}
				}

			} else {
				for (let i of response[0]) {
					if (typeof i == "number") {
						prodSum.push(parseFloat(i))
					}
				}
			}

			if (tablesRead == 5) {

				hours = response[1]

				items.push({
					table: table,
					res: await decimalFormater.formatRequestedData(response[0]),
					interval: hours,
					monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					period: 'day'
				})

				items.push({
					table: 6,
					res: await decimalFormater.formatRequestedData(prodSum),
					interval: hours,
					monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					period: 'day'
				})

				resolve(items)

			} else {
				hours = response[1]
				items.push({
					table: table,
					res: await decimalFormater.formatRequestedData(response[0]),
					interval: hours,
					monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					period: 'day'
				})
			}

		})

	})
}

module.exports = { IreceProductionServices }