const server = require('../config/server').server
const service = require('../model/readCGProduction').CampoGrandeProductionServices

const respond = async (req, res, next) => {
    
    if (req.params.period === 'day') {
		service.readForOneDay(req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if (req.params.period === 'month') {
		service.readForOneMonth(req.params.date)
        .then((responseData) => {
            res.send(200, responseData)
        })
        .catch((err) => {
            res.send(404, err)
        })
	} else if (req.params.period === 'year') {
        service.readForOneYear(req.params.date)
            .then(responseData => {
                res.send(200, responseData)
            })
            .catch(err => {
                req.send(404, err)
            })
    }
    
    next()

}

server.get('/campo-grande/producao/:date/:period', respond)
server.head('/campo-grande/producao/:date/:period', respond)

module.exports = { server }