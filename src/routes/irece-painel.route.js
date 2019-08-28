const server = require('../config/server').server

server.get('/irece/painel', (req, res, next) => {
    res.send('Irece Painel')
    next()
})

module.exports = { server }