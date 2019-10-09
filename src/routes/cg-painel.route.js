const server = require('../config/server').server

server.post('/campo-grande/painel', (req, res, next) => {
    res.send('Campo Grande Painel')
    return next()
})

module.exports = { server }