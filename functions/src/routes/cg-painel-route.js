const server = require('../config/server').server

server.get('/campo-grande/painel', (req, res, next) => {
    res.send('Campo Grande Painel')
    next()
})

module.exports = { server }