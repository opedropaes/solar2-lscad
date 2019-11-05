const server = require('../config/server').server
const service = require('../model/readIreceLosses').IreceLossesServices

server.get('/irece/perdas/mesas/:table/:date/:period', (req, res, next) => {

    if (req.params.period == "month") {
		service.readForOneMonth(req.params.table, req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if (req.params.period == "year") {
		service.readForOneYear(req.params.table, req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	}

    next()
  
})