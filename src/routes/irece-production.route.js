const server = require('../config/server').server
const service = require('../model/readIreceProduction').IreceProductionServices

server.get('/irece/producao/:date/:period', (req, res, next) => {
    
    if (req.params.period == 'day') {
		service.readForOneDay(req.params.date)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if(req.params.period == 'month') {
		service.readForOneMonth(req.params.date)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if(req.params.period == 'year') {
		service.readForOneYear(req.params.date)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })
	}

    next()

})

module.exports = { server }