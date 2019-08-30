const server = require('../config/server').server
const service = require('../model/readIreceProduction').IreceProductionServices

server.get('/irece/producao/:date', (req, res, next) => {
    
    service.readForOneDay(req.params.date)
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })

    next()

})

module.exports = { server }