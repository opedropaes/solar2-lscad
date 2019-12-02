const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient;

const max = (array) => {
    let max = 0
    array.map(item => {
        max = (item > max) ? item : max
    })
    return max
}

const dataAverage = (data, dates) => {

    try {
        let lossesSumsPerMinute = 0
        let qtd = 0

        let interval = []
        let losses = []

        for (let i = 0; i < dates.length; i++) {

            losses.push(parseFloat(data[i]))

            let minute = dates[i][3] + dates[i][4]

            lossesSumsPerMinute += parseFloat(data[i])
            qtd++

            if (minute % 15 == 0) {

                losses.push(parseFloat(parseFloat(lossesSumsPerMinute / qtd).toFixed(3)))
                interval.push(dates[i])

                qtd = 0
                lossesSumsPerMinute = 0
            }

        }

        return {
            losses,
            interval
        }

    } catch (error) {
        return error
    }

}

const requireAWSData = async (params) => {
    return new Promise((resolve, reject) => {

        let i = 0
        let items = []
        let interval = []
        let completeDates = []
        let losses = []
        let totalLosses = 0

        docClient.query(params, (err, data) => {
            if (err) {
                reject(err)
            }
            else {
                data.Items.forEach((item) => {
                    if (typeof data.Items != "undefined") {

                        let dia_mes_ano = item.dia_mes_ano
                        let hora_minuto = item.hora_minuto + '00'
                        let loss = item.Perda_p
                        let correctedDate = 
                            dia_mes_ano[4] +
                            dia_mes_ano[5] +
                            dia_mes_ano[6] +
                            dia_mes_ano[7] +
                            dia_mes_ano[2] +
                            dia_mes_ano[3] +
                            dia_mes_ano[0] +
                            dia_mes_ano[1]

                        let formatedDate = dateFormater.formatDate(correctedDate, hora_minuto)

                        items.push({
                            loss,
                            day: parseInt(formatedDate.day),
                            hourMin: formatedDate.hourMin,
                            yearMonth: formatedDate.yearMonth,
                            completeDate: formatedDate.completeDate,
                        })

                        completeDates.push(formatedDate.completeDate)
                        interval.push(formatedDate.hourMin)

                    }
                })

                interval.sort()
                completeDates.sort()

                for (let day of interval) {
                    for (let item of items) {
                        if (day == item.hourMin) {
                            losses.push(parseFloat(item.loss))
                            totalLosses += parseFloat(item.loss)
                        }
                    }

                }

            }

            resolve([
                losses,
                totalLosses,
                interval,
                completeDates,
            ])

        })
    })
}

const readLosses = async (date) => {
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
                'losses-control',
                null,
                dateToRequest.day,
                dateToRequest.month,
                dateToRequest.year,
                null
            )

        requireAWSData(params)
            .then(async (response) => {

                let averagesObject = await dataAverage(response[0], response[2])
                let lossesSum = response[0].reduce((acc, cur) => acc + parseFloat(cur))
                let lossesAverage = parseFloat((lossesSum / response[0].length).toFixed(3))

                let items = {
                    type: "mpc",
                    from: "ufms",
                    period: "day",
                    loss: averagesObject.losses,
                    totalLosses: response[1],
                    lossesAverage,
                    interval: averagesObject.interval,
                    year: dateToRequest.year,
                    month: dateToRequest.month,
                    yearMonth: dateToRequest.month + "/" + dateToRequest.year,
                }

                resolve(items)

            })
            .catch((err) => {
                let items = {
                    err,
                    type: "mpc",
                    from: "ufms",
                    period: "day",
                    loss: [0],
                    totalLosses: 0,
                    lossesAverage: 0,
                    interval: [0],
                    year: dateToRequest.year,
                    month: dateToRequest.month,
                    yearMonth: dateToRequest.month + "/" + dateToRequest.year,
                }

                resolve(items)
            })

    })
}

CampoGrandeLossesServices = {}

CampoGrandeLossesServices.readForOneDay = async (date) => {
    return new Promise((resolve, reject) => {
        readLosses(date)
            .then(response => {
                resolve(response)
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = { CampoGrandeLossesServices }