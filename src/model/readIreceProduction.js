const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const decimalFormater = require('./format-decimal')
const AWSConfig = require('../config/config')
const daysInMonthDefiner = require('../utils/daysInMonthDefiner')
const ireceEnvironmental = require('./readIreceEnvironmental').IreceEnvironmentalServices

const docClient = AWSConfig.docClient;

const requireAWSData = async (table, params) => {
	return new Promise((resolve, reject) => {

		let i = 0
		let items = []
		let interval = []
		let pac = []
		let iac = []
		let idc = []
		let vac = []
		let vdc = []

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
									pac: (item.P_AC / 1000),
									iac: item.I_AC,
									idc: item.I_DC,
									vac: item.V_AC,
									vdc: item.V_DC,
									hour: formatedDate.hour,
									minutes: formatedDate.min,
									hourMinute: formatedDate.hourMin
								}
							}

							let exists = false

							for (let item of interval) {
								if (item == formatedDate.hourMin) {
									exists = true
									break
								}
							}

							if (!exists) {
								interval.push(formatedDate.hourMin)
							}

							i++;
						}
					}
				})

				interval.sort()

				for (let hour of interval) {
					for (let item of items) {
						if (hour == item.hourMinute) {
							pac.push(item.pac)
							iac.push(item.iac)
							idc.push(item.idc)
							vac.push(item.vac)
							vdc.push(item.vdc)
						}
					}
				}

			}

			resolve([pac, iac, idc, vac, vdc, interval])

		})
	})
}

const allPromises = async (date, table) => {

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

	const productionPromise = new Promise(async (resolve, reject) => {

		let items = {}
		let interval = []

		if (table < 6) {
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
			let production = await decimalFormater.formatRequestedData(response[0])
			let alternateCurrent = await decimalFormater.formatRequestedData(response[1])
			let continuousCurrent = await decimalFormater.formatRequestedData(response[2])
			let alternateVoltage = await decimalFormater.formatRequestedData(response[3])
			let continuousVoltage = await decimalFormater.formatRequestedData(response[4])
			let totalProduction = (production.length) ? production.reduce((acc, cur) => acc + parseFloat(cur)) : 0

			interval = response[5]

			items = {
				table,
				production,
				continuousCurrent,
				continuousVoltage,
				alternateCurrent,
				alternateVoltage,
				interval,
				totalProduction,
				monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
				day: dateToRequest.day,
				month: dateToRequest.month,
				year: dateToRequest.year,
				period: 'day'
			}

			resolve(items)
		}

		else if (table == 6) {

			let table1 = []
			let table2 = []
			let table3 = []
			let table4 = []
			let table5 = []
			let table6 = []
			let tablesRead = 0
			let prodSum = []
			let tables = [1, 2, 3, 4, 5]

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

					interval = response[5]
					table6 = await decimalFormater.formatRequestedData(prodSum)

					items = {
						table1,
						table2,
						table3,
						table4,
						table5,
						table6,
						interval,
						monthDay: dateToRequest.day + "/" + dateToRequest.month + "/" + dateToRequest.year,
						day: dateToRequest.day,
						month: dateToRequest.month,
						year: dateToRequest.year,
						period: 'day'
					}

					resolve(items)

				}

			})
		}

		else resolve("Not existent table " + table + ".")

	})

	const environmentalPromise = new Promise ((resolve, reject) => {

		ireceEnvironmental.readForOneDay(dateToRequest.year + dateToRequest.month + dateToRequest.day)
			.then(response => {

				let totalIrradiation = (response.solarRadiation.length) ? response.solarRadiation.reduce((acc, cur) => acc + cur) : 0
				let irradiationAverage = parseFloat(((totalIrradiation / 1000) / response.solarRadiation.length).toFixed(3))

				let items = {
					totalIrradiation,
					irradiationAverage,
					irradiation: response.solarRadiation
				}

				resolve(items)

			})
			.catch(err => {

				let items = {
					totalIrradiation: [0],
					irradiationAverage,
					irradiation: response.solarRadiation
				}

				resolve(items)

			})

	})

	return Promise.all([productionPromise, environmentalPromise])

}

IreceProductionServices = {}

IreceProductionServices.readForOneDay = async (date, table) => {

	return new Promise((resolve, reject) => {
		allPromises(date, table)
			.then(response => {

				if (table < 6) {

					let painelEfficiencyDegree = 0.175
					let productionAverage = parseFloat((response[0].totalProduction / response[0].production.length).toFixed(3))
					let nominalProduction = parseFloat((response[1].irradiationAverage * painelEfficiencyDegree).toFixed(3))
					let performanceRatio = parseFloat((productionAverage / nominalProduction).toFixed(2))
					let capacityFactor = []

					if (response[0].production.length) {
						response[0].production.map(item => {
							capacityFactor.push(parseFloat((item / 10.45).toFixed(3)))
						})
					} else capacityFactor = [0]

					let items = {
						productionAverage,
						performanceRatio,
						capacityFactor,
						table: response[0].table,
						production: response[0].production,
						continuousCurrent: response[0].continuousCurrent,
						continuousVoltage: response[0].continuousVoltage,
						alternateCurrent: response[0].alternateCurrent,
						alternateVoltage: response[0].alternateVoltage,
						interval: response[0].interval,
						totalProduction: response[0].totalProduction,
						totalIrradiation: response[1].totalIrradiation,
						irradiationAverage: response[1].irradiationAverage,
						irradiation: response[1].irradiation,
						monthDay: response[0].day + "/" + response[0].month + "/" + response[0].year,
						day: response[0].day,
						month: response[0].month,
						year: response[0].year,
						period: 'day'
					}

					resolve(items)

				}

				else if (table == 6) {

					let items = {
						table1: response[0].table1,
						table2: response[0].table2,
						table3: response[0].table3,
						table4: response[0].table4,
						table5: response[0].table5,
						table6: response[0].table6,
						interval: response[0].interval,
						totalIrradiation: response[1].totalIrradiation,
						irradiationAverage: response[1].irradiationAverage,
						irradiation: response[1].irradiation,
						monthDay: response[0].day + "/" + response[0].month + "/" + response[0].year,
						day: response[0].day,
						month: response[0].month,
						year: response[0].year,
						period: 'day'
					}

					resolve(items)
				}
			})
			.catch(err => {
				
				console.log(err)
				reject(err)

			})
	})

}

//Corrigir aqui com base no novo retorno do de cima
IreceProductionServices.readForOneMonth = async (date, table) => {

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

	return new Promise((resolve, reject) => {

		let items = {}
		let monthInterval = []
		let daysThisMonth = daysInMonthDefiner.howMayDaysThisMonth(dateToRequest.month)
		let days = []

		for (let i = 1; i <= daysThisMonth; i++) {
			days.push((i < 10) ? "0" + i : i)
		}

		if (table < 6) {

			let averageProduction = []

			days.map(day => {
				IreceProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day, table)
					.then((response) => {
						let totalProduction = (response.tableData.length) ? response.tableData.reduce((acc, cur) => acc + cur) : 0

						averageProduction[day - 1] = parseFloat((totalProduction / 4).toFixed(3)) || 0

						monthInterval.push(day)
						monthInterval.sort()

						if (monthInterval.length == days.length) {
							items = {
								table,
								tableData: averageProduction,
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
							table,
							tableData: [0],
							interval: monthInterval,
							monthDay: dateToRequest.month + "/" + dateToRequest.year,
							month: dateToRequest.month,
							year: dateToRequest.year,
							period: 'month'
						}

						resolve(items)

					})
			})
		}

		else if (table == 6) {

			let averageProductionTable1 = []
			let averageProductionTable2 = []
			let averageProductionTable3 = []
			let averageProductionTable4 = []
			let averageProductionTable5 = []
			let averageProductionTable6 = []

			days.map(day => {
				IreceProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day, table)
					.then((response) => {

						let totalProductionTable1 = (response.table1.length) ? response.table1.reduce((acc, cur) => acc + cur) : 0
						let totalProductionTable2 = (response.table2.length) ? response.table2.reduce((acc, cur) => acc + cur) : 0
						let totalProductionTable3 = (response.table3.length) ? response.table3.reduce((acc, cur) => acc + cur) : 0
						let totalProductionTable4 = (response.table4.length) ? response.table4.reduce((acc, cur) => acc + cur) : 0
						let totalProductionTable5 = (response.table5.length) ? response.table5.reduce((acc, cur) => acc + cur) : 0
						let totalProductionTable6 = (response.table6.length) ? response.table6.reduce((acc, cur) => acc + cur) : 0

						averageProductionTable1[day - 1] = parseFloat((totalProductionTable1 / 4).toFixed(3)) || 0
						averageProductionTable2[day - 1] = parseFloat((totalProductionTable2 / 4).toFixed(3)) || 0
						averageProductionTable3[day - 1] = parseFloat((totalProductionTable3 / 4).toFixed(3)) || 0
						averageProductionTable4[day - 1] = parseFloat((totalProductionTable4 / 4).toFixed(3)) || 0
						averageProductionTable5[day - 1] = parseFloat((totalProductionTable5 / 4).toFixed(3)) || 0
						averageProductionTable6[day - 1] = parseFloat((totalProductionTable6 / 4).toFixed(3)) || 0

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
		}

		else resolve("Not existent table " + table + ".")

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