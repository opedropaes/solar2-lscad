const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient;

const requireAWSData = async (table, params) => {
    return new Promise((resolve, reject) => {

        let i = 0
        let items = []
        let interval = []
        let sortedItems = []
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

IreceLossesServices = {}

IreceLossesServices.readForOneMonth = async (table, date) => {
    
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

module.exports = { IreceLossesServices }