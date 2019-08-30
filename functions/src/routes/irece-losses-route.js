const server = require('../config/server').server
const service = require('../model/readIreceLosses').IreceLossesServices

server.get('/irece/perdas/:table', (req, res, next) => {

    service.readForOneMonth(req.params.table)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })

    next()
    
})