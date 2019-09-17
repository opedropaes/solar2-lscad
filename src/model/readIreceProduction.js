const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const decimalFormater = require('./format-decimal')
const AWSConfig = require('../config/config')
const daysInMonthDefiner = require('../utils/daysInMonthDefiner')

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
		let tablesRead = 0
		let prodSum = []
		let items = {}
		let hours = []
		let table1 = []
		let table2 = []
		let table3 = []
		let table4 = []
		let table5 = []
		let table6 = []

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

			if (table == 1)
				table1 = await decimalFormater.formatRequestedData(response[0])
			if (table == 2)
				table2 = await decimalFormater.formatRequestedData(response[0])
			if (table == 3)
				table3 = await decimalFormater.formatRequestedData(response[0])
			if (table == 4)
				table4 = await decimalFormater.formatRequestedData(response[0])
			if (table == 5)
				table5 = await decimalFormater.formatRequestedData(response[0])

			if (tablesRead == 5) {

				hours = response[1]
				table6 = await decimalFormater.formatRequestedData(prodSum)

				items = {
					table1,
					table2,
					table3,
					table4,
					table5,
					table6,
					interval: hours,
					monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
					day: dateToRequest.day,
					month: dateToRequest.month,
					year: dateToRequest.year,
					period: 'day'
				}

				resolve(items)

			}

		})

	})
}

IreceProductionServices.readForOneMonth = async (date) => {

	let items = {}
	let monthInterval = []
	let averageProductionTable1 = []
	let averageProductionTable2 = []
	let averageProductionTable3 = []
	let averageProductionTable4 = []
	let averageProductionTable5 = []
	let averageProductionTable6 = []

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
			IreceProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day)
				.then((response) => {

					let effectiveHours = response.interval.length / 4

					let totalProductionTable1 = (response.table1.length) ? response.table1.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable2 = (response.table2.length) ? response.table2.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable3 = (response.table3.length) ? response.table3.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable4 = (response.table4.length) ? response.table4.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable5 = (response.table5.length) ? response.table5.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable6 = (response.table6.length) ? response.table6.reduce((acc, cur) => acc + cur) : 0

					averageProductionTable1[day - 1] = parseFloat((totalProductionTable1 / effectiveHours).toFixed(3)) || 0
					averageProductionTable2[day - 1] = parseFloat((totalProductionTable2 / effectiveHours).toFixed(3)) || 0
					averageProductionTable3[day - 1] = parseFloat((totalProductionTable3 / effectiveHours).toFixed(3)) || 0
					averageProductionTable4[day - 1] = parseFloat((totalProductionTable4 / effectiveHours).toFixed(3)) || 0
					averageProductionTable5[day - 1] = parseFloat((totalProductionTable5 / effectiveHours).toFixed(3)) || 0
					averageProductionTable6[day - 1] = parseFloat((totalProductionTable6 / effectiveHours).toFixed(3)) || 0

					monthInterval.push(day)
					monthInterval.sort()

					if (monthInterval.length == days.length) {
						items = {
							table1: averageProductionTable1,
							table2: averageProductionTable2,
							table3: averageProductionTable3,
							table4: averageProductionTable4,
							table5: averageProductionTable5,
							table6: averageProductionTable6,
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
						table1: [0],
						table2: [0],
						table3: [0],
						table4: [0],
						table5: [0],
						table6: [0],
						interval: monthInterval,
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

IreceProductionServices.readForOneYear = async (date) => {

	let items = []
	let yearInterval = []
	let averageProductionTable1 = []
	let averageProductionTable2 = []
	let averageProductionTable3 = []
	let averageProductionTable4 = []
	let averageProductionTable5 = []
	let averageProductionTable6 = []

	let dateToRequest = {
		year:
			date[0] +
			date[1] +
			date[2] +
			date[3]
	}

	let months = []

	for (let i = 1; i <= 12; i++) {
		months.push((i < 10) ? "0" + i : i)
	}

	return new Promise((resolve, reject) => {
		months.map(month => {
			IreceProductionServices.readForOneMonth(dateToRequest.year + month + 10)
				.then((response) => {

					let effectiveDays = response.interval.length

					let totalProductionTable1 = (response.table1.length) ? response.table1.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable2 = (response.table2.length) ? response.table2.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable3 = (response.table3.length) ? response.table3.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable4 = (response.table4.length) ? response.table4.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable5 = (response.table5.length) ? response.table5.reduce((acc, cur) => acc + cur) : 0
					let totalProductionTable6 = (response.table6.length) ? response.table6.reduce((acc, cur) => acc + cur) : 0

					averageProductionTable1[month - 1] = parseFloat((totalProductionTable1 / effectiveDays).toFixed(3)) || 0
					averageProductionTable2[month - 1] = parseFloat((totalProductionTable2 / effectiveDays).toFixed(3)) || 0
					averageProductionTable3[month - 1] = parseFloat((totalProductionTable3 / effectiveDays).toFixed(3)) || 0
					averageProductionTable4[month - 1] = parseFloat((totalProductionTable4 / effectiveDays).toFixed(3)) || 0
					averageProductionTable5[month - 1] = parseFloat((totalProductionTable5 / effectiveDays).toFixed(3)) || 0
					averageProductionTable6[month - 1] = parseFloat((totalProductionTable6 / effectiveDays).toFixed(3)) || 0

					yearInterval.push(month)
					yearInterval.sort()

					if (yearInterval.length == months.length) {
						items = {
							table1: averageProductionTable1,
							table2: averageProductionTable2,
							table3: averageProductionTable3,
							table4: averageProductionTable4,
							table5: averageProductionTable5,
							table6: averageProductionTable6,
							interval: yearInterval,
							year: dateToRequest.year,
							period: 'year'
						}

						resolve(items)
					}

				})
				.catch((err) => {
					console.log(err)
				})
		})

	})



}

module.exports = { IreceProductionServices }