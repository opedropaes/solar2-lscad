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

	const environmentalPromise = new Promise((resolve, reject) => {

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
						table,
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

				reject(err)

			})
	})

}

IreceProductionServices.readForOneMonth = async (date, table) => {

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

	let daysThisMonth = daysInMonthDefiner.howMayDaysThisMonth(dateToRequest.month)
	let days = []

	for (let i = 1; i <= daysThisMonth; i++) {
		days.push((i < 10) ? "0" + i : i)
	}

	if (table < 6) {
		return new Promise((resolve, reject) => {
			days.map(day => {
				IreceProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day, table)
					.then((response) => {

						let totalAverage = (response.production.length) ? response.production.reduce((acc, cur) => acc + cur) : 0
						let totalCapacityFactor = (response.capacityFactor.length) ? response.capacityFactor.reduce((acc, cur) => acc + cur) : 0
						let totalProduction = parseFloat((response.totalProduction).toFixed(3)) || 0
						let performanceRatioIsNumber = (typeof response.performanceRatio == "number")
						let performanceRatio = (performanceRatioIsNumber) ? response.performanceRatio : 0

						averageProduction[day - 1] = parseFloat((totalAverage / 4).toFixed(3)) || 0
						averageCapacityFactor[day - 1] = parseFloat((totalCapacityFactor / response.capacityFactor.length).toFixed(3)) || 0
						totalProductions[day - 1] = totalProduction
						performances[day - 1] = performanceRatio

						monthInterval.push(day)
						monthInterval.sort()

						if (monthInterval.length == days.length) {

							let totalPerformanceRatio = 0

							if (performances.length) {
								performances.map((item) => {
									if (!isNaN(item))
										totalPerformanceRatio += parseFloat(item)
								})
							}

							let effectivePerformanceDays = performances.filter((effectiveDay) => { return effectiveDay > 0 })
							let totalPerformanceRatioAverage = totalPerformanceRatio / effectivePerformanceDays.length
							let totalPerformanceRatioComparison = [
								parseFloat((totalPerformanceRatioAverage).toFixed(2)),
								parseFloat((100 - totalPerformanceRatioAverage).toFixed(2))
							]

							items = {
								table,
								averages: averageProduction,
								capacityFactor: averageCapacityFactor,
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
							table,
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

	else if (table == 6) {
		return new Promise((resolve, reject) => {

			let table1 = []
			let table2 = []
			let table3 = []
			let table4 = []
			let table5 = []
			let table6 = []

			days.map(day => {
				IreceProductionServices.readForOneDay(dateToRequest.year + dateToRequest.month + day, table)
					.then((response) => {

						let totalProductionTable1 = (response.table1.length) ? response.table1.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						let totalProductionTable2 = (response.table2.length) ? response.table2.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						let totalProductionTable3 = (response.table3.length) ? response.table3.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						let totalProductionTable4 = (response.table4.length) ? response.table4.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						let totalProductionTable5 = (response.table5.length) ? response.table5.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						let totalProductionTable6 = (response.table6.length) ? response.table6.reduce((acc, cur) => acc + parseFloat(cur)) : 0
						
						let averageTable1 = (response.table1.length) ? totalProductionTable1 / 4 : 0
						let averageTable2 = (response.table2.length) ? totalProductionTable2 / 4 : 0
						let averageTable3 = (response.table3.length) ? totalProductionTable3 / 4 : 0
						let averageTable4 = (response.table4.length) ? totalProductionTable4 / 4 : 0
						let averageTable5 = (response.table5.length) ? totalProductionTable5 / 4 : 0
						let averageTable6 = (response.table6.length) ? totalProductionTable6 / 4 : 0
												
						table1.push(parseFloat((averageTable1).toFixed(3)))
						table2.push(parseFloat((averageTable2).toFixed(3)))
						table3.push(parseFloat((averageTable3).toFixed(3)))
						table4.push(parseFloat((averageTable4).toFixed(3)))
						table5.push(parseFloat((averageTable5).toFixed(3)))
						table6.push(parseFloat((averageTable6).toFixed(3)))
	
						monthInterval.push(day)
						monthInterval.sort()
	
						if (monthInterval.length == days.length) {
	
							items = {
								table,
								table1,
								table2,
								table3,
								table4,
								table5,
								table6,
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
	
						items = {
							err,
							table,
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

}

module.exports = { IreceProductionServices }