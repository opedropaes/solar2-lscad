const server = require('../config/server').server
const service = require('../model/readCGEnvironmental').CampoGrandeEnvironmentalServices

server.get('/campo-grande/ambientais', (req, res, next) => {

    service.readForOneDay()
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })

    next()

})

module.exports = { server }