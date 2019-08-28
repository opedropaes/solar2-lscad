const server = require('../config/server').server
const service = require('../model/readCGProduction').CampoGrandeProductionServices

server.get('/campo-grande/producao/:date', async (req, res, next) => {
    
    service.readForOneDay(req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
    
    next()

})

module.exports = { server }