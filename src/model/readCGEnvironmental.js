const tableDefiner = require('./define-table')
const dateFormater = require('./format-date')
const AWSConfig = require('../config/config')

const docClient = AWSConfig.docClient;

let now = new Date

const requireAWSData = async (params) => {
    return new Promise((resolve, reject) => {

        let items = []
        let interval = []
        let sortedItems = []

        docClient.scan(params, (err, data) => {
            if (err) {
                reject("Unable to scan table. Error JSON: " + JSON.stringify(err, null, 2))
            }
            else {

                data.Items.forEach(function (item) {
                    if (typeof data.Items != "undefined") {
                        if (item.uv > 0) {

                            let timestamp = JSON.stringify(item.timestamp)
                            let dateTimestamp = ''

                            for (let i = 0; i < 8; i++) {
                                dateTimestamp += timestamp[i]
                            }

                            let hourTimestamp = ''

                            for (let i = 8; i < 14; i++) {
                                hourTimestamp += timestamp[i]
                            }

                            let formatedDate = dateFormater.formatDate(dateTimestamp, hourTimestamp)

                            if (formatedDate.min % 15 == 0) {

                                items.push({
                                    date: formatedDate.hourMin,
                                    irradiation: item.uv,
                                    temperature: item.temp,
                                    humidity: item.hum,
                                    wind: item.wind_speed
                                })

                                interval.push(formatedDate.hourMin)
                                interval.sort()

                            }

                        }

                    }

                });

                for (let hour of interval) {
                    for (let item of items) {
                        if (hour == item.date) {
                            sortedItems.push({
                                date: item.date,
                                irradiation: item.irradiation,
                                temperature: item.temperature,
                                humidity: item.humidity,
                                wind: item.wind
                            })
                        }
                    }
                }

            }

            resolve([sortedItems, interval])

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

    return new Promise((resolve, reject) => {

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
                resolve(response)
            })
            .catch((err) => {
                reject(err)
            })

    })
}

module.exports = { CampoGrandeEnvironmentalServices }