const server = require('../config/server').server
const service = require('../model/readCGLossesMPC').CampoGrandeLossesServices

server.get('/campo-grande/perdas/:date/:period', (req, res, next) => {

    if (req.params.period == "day") {
        service.readForOneDay(req.params.date)
            .then((responseData) => {
                res.send(200, responseData)
            })
            .catch((err) => {
                res.send(404, err)
            })
    }
    
    next()

})