const server = require('../config/server').server

server.get('/sobre', (req, res, next) => {
    res.send('Sobre')
    next()
})

module.exports = { server }