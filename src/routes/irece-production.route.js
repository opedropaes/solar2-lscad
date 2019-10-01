const server = require('../config/server').server
const service = require('../model/readIreceProduction').IreceProductionServices

server.get('/irece/producao/mesas/:table/:date/:period', (req, res, next) => {
    
    if (req.params.period == 'day') {
		service.readForOneDay(req.params.date, req.params.table)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if(req.params.period == 'month') {
		service.readForOneMonth(req.params.date, req.params.table)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if(req.params.period == 'year') {
		service.readForOneYear(req.params.date, req.params.table)
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