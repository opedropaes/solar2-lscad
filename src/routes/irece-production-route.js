const server = require('../config/server').server
const service = require('../model/readIreceProduction').IreceProductionServices

server.get('/irece/producao', (req, res, next) => {
    
    service.readForOneDay()
        .then((response) => {
            res.send(200, response)
        })
        .catch((err) => {
            res.send(404, err)
        })

    next()

})

module.exports = { server }