const server = require('../config/server').server

server.get('/cadastro', (req, res, next) => {
    res.send('Cadastro')
    next()
})

module.exports = { server }