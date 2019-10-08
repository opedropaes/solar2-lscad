const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient;

const requireAWSData = async (table, params) => {
    return new Promise((resolve, reject) => {

        let i = 0
        let items = []
        let interval = []
        let completeDates = []
        let loss = []
        let lossPercentage = []
        let realProd = []
        let idealProd = []
        let viability = []
        let totalLoss = 0
        let comparation = 0
        let totalProducion = 0


        docClient.scan(params, (err, data) => {
            if (err) {
                reject(err)
            }
            else {
                data.Items.forEach((item) => {
                    if (typeof data.Items != "undefined") {

                        let timestamp = JSON.stringify(item.timestamp)
                        let itemDate = JSON.stringify(item.data)
                        let dateTimestamp = ''
                        let loss = 0
                        let realProd = 0
                        let idealProd = 0
                        let lossPercentage = 0

                        for (let i = 0; i < 8; i++) {
                            dateTimestamp += itemDate[i]
                        }

                        let hourTimestamp = ''

                        for (let i = 8; i < 14; i++) {
                            hourTimestamp += timestamp[i]
                        }

                        let formatedDate = dateFormater.formatDate(dateTimestamp, hourTimestamp)
                        
                        idealProd = parseFloat((item.tot_ideal / 1000).toFixed(3))
                        realProd = parseFloat((item.tot_prod / 1000).toFixed(3))

                        if (item.limpeza_viabilidade == true) {
                            loss = parseFloat((item.perda / 1000)).toFixed(3)
                            lossPercentage = (100 * (1 - parseFloat( realProd/idealProd )).toFixed(3))
                        }

                        items.push({
                            loss: loss,
                            lossPercentage: lossPercentage,
                            realProd: realProd,
                            idealProd: idealProd,
                            day: parseInt(formatedDate.day),
                            monthDay: formatedDate.monthDay,
                            yearMonth: formatedDate.yearMonth,
                            completeDate: formatedDate.completeDate,
                            viability: item.limpeza_viabilidade
                        })

                        completeDates.push( formatedDate.completeDate )
                        interval.push( formatedDate.monthDay )

                    }
                })

                interval.sort()
                completeDates.sort()

                for (let day of interval) {
                    for (let item of items) {
                        if (day == item.monthDay) {
                            loss.push(parseFloat(item.loss))
                            lossPercentage.push(parseFloat(item.lossPercentage).toFixed(2))
                            realProd.push(item.realProd)
                            idealProd.push(item.idealProd)
                            viability.push(item.viability)
                            totalLoss += parseFloat(item.loss)
                            totalProducion += parseFloat(item.realProd)
                        }
                    }

                }

            }

            comparation = parseFloat(100 * (totalLoss / totalProducion))

            resolve([
                loss,
                lossPercentage,
                realProd,
                idealProd,
                viability,
                interval,
                completeDates,
                comparation
            ])

        })
    })
}

const readLosses = async (table, date) => {
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
                'losses',
                table,
                dateToRequest.day,
                dateToRequest.month,
                dateToRequest.year,
                null
            )

        requireAWSData(table, params)
            .then((response) => {

                let items = {
                    table,
                    period: "month",
                    loss: response[0],
                    interval: response[5],
                    realProd: response[2],
                    idealProd: response[3],
                    viability: response[4],
                    year: dateToRequest.year,
                    month: dateToRequest.month,
                    completeDates: response[6],
                    lossPercentage: response[1],
                    yearMonth: dateToRequest.month + "/" + dateToRequest.year,
                    comparation: [(100 - response[7]).toFixed(3), response[7].toFixed(3)],
                    comparationLabels: ['Produção total', 'Perdas']
                }

                resolve(items)

            })
            .catch((err) => {
                reject(err)
            })

    })
}

IreceLossesServices = {}

IreceLossesServices.readForOneMonth = async (table, date) => {
    if(table === "total") {
        return new Promise((resolve, reject) => {
            let tables = [1, 2, 3, 4, 5]
            let tablesRead = 0
            let lossesPerTable = []
            let lossesRanking = []
            let totalLosses = []
            let auxiliar = []
            let allRealProduction = []
            let allLossesPercentage = []

            tables.map(thisTable => {
                readLosses(thisTable, date)
                    .then(response => {

                        tablesRead++
                        lossesPerTable[response.table - 1] = response.comparation[1]
                        auxiliar[response.table - 1] = response.comparation[1]

                        // Soma todas as perdas por dia (em kW)
                        let lossExists = response.loss.length
                        if (lossExists) {
                            response.loss.map(loss => {
                                let originalPosition = response.loss.indexOf(loss)
                                if (totalLosses[originalPosition] != null) {
                                    totalLosses[originalPosition] += loss
                                } else {
                                    totalLosses[originalPosition] = loss
                                }
                            })
                        }

                        // Aglomera as produções reais de cada mesa
                        allRealProduction[response.table - 1] = response.realProd
                        
                        // Aglomera as perdas em porcentagem de cada mesa
                        allLossesPercentage[response.table - 1] = response.lossPercentage

                        if (tablesRead === tables.length) {

                            // Define ranking de mesas que mais tiveram perdas (em %)
                            let sortedLosses = auxiliar
                            sortedLosses.sort((a, b) => b - a)

                            lossesPerTable.map(loss => {
                                let originalTableAsPositionToRank = lossesPerTable.indexOf(loss)
                                let descendingRankedPosition = sortedLosses.indexOf(loss)
                               
                                lossesRanking[descendingRankedPosition] = ({
                                    table: originalTableAsPositionToRank + 1,
                                    loss
                                })
                            
                            })

                            let realProductionTable1 = allRealProduction[0]
                            let realProductionTable2 = allRealProduction[1]
                            let realProductionTable3 = allRealProduction[2]
                            let realProductionTable4 = allRealProduction[3]
                            let realProductionTable5 = allRealProduction[4]

                            let lossPercentageTable1 = allLossesPercentage[0]
                            let lossPercentageTable2 = allLossesPercentage[1]
                            let lossPercentageTable3 = allLossesPercentage[2]
                            let lossPercentageTable4 = allLossesPercentage[3]
                            let lossPercentageTable5 = allLossesPercentage[4]

                            // Formata a soma das perdas (em kW)
                            totalLosses.map(loss => {
                                totalLosses[totalLosses.indexOf(loss)] = parseFloat((loss).toFixed(3))
                            })

                            let items = {
                                table: "total",
                                totalLosses,
                                lossesRanking,
                                realProductionTable1,
                                realProductionTable2,
                                realProductionTable3,
                                realProductionTable4,
                                realProductionTable5,
                                lossPercentageTable1,
                                lossPercentageTable2,
                                lossPercentageTable3,
                                lossPercentageTable4,
                                lossPercentageTable5,
                                interval: response.interval,
                                period: "month",
                                year: response.year,
                                month: response.month
                            }

                            resolve(items)
                        }

                    })
                    .catch(err => {
                        let items = {
                            err,
                            table: "total",
                            totalLosses: [0],
                            lossesRanking: [0],
                            realProductionTable1: [0],
                            realProductionTable2: [0],
                            realProductionTable3: [0],
                            realProductionTable4: [0],
                            realProductionTable5: [0],
                            lossPercentageTable1: [0],
                            lossPercentageTable2: [0],
                            lossPercentageTable3: [0],
                            lossPercentageTable4: [0],
                            lossPercentageTable5: [0],
                            interval: [0],
                            period: "month",
                            year: undefined,
                            month: undefined
                        }
                    })
            })
        })


    } else if (table > 0 && table < 6) {
        return new Promise((resolve, reject) => {
            readLosses(table, date)
                .then(response => {
                    resolve(response)
                })
                .catch(err => {
                    reject(err)
                })
        })
        

    } else return "This table does not exist."
}

module.exports = { IreceLossesServices }