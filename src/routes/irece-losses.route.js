const server = require('../config/server').server
const service = require('../model/readIreceLosses').IreceLossesServices

server.get('/irece/perdas/mesas/:table/:date', (req, res, next) => {

    service.readForOneMonth(req.params.table, req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })

    next()
    
})