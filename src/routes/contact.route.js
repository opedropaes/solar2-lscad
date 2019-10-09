const server = require('../config/server').server

server.get('/contato', (req, res, next) => {
    res.send('Contato')
    next()
})

module.exports = { server }