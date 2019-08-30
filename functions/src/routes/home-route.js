const server = require('../config/server').server

server.get('/', (req, res, next) => {
    res.send('Home')
    next()
})

module.exports = { server }