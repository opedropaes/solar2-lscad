const server = require('../config/server').server
const service = require('../model/readIreceEnvironmental').IreceEnvironmentalServices

server.get('/irece/ambientais/:date/:period', (req, res, next) => {

    if (req.params.period == 'day') {
		service.readForOneDay(req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if (req.params.period == 'month') {
		service.readForOneMonth(req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	}

    next()

})

module.exports = { server }