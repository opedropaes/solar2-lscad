const server = require('../config/server').server

server.get('/login', (req, res, next) => {
    res.send('Login')
    next()
})

module.exports = { server }