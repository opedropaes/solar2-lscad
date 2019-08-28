const port = process.env.PORT || 3000

const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')

require('dotenv').config()

const server = restify.createServer({
    ignoreTrailingSlash: true,
    accept: [
        'application/json',
        'text/html',
        'image/png',
        'image/jpg'
    ]
})

const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['*']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.use(restify.plugins.bodyParser({
    mapParams: true,
    mapFiles: false,
}))

server.use(restify.plugins.queryParser())

module.exports = {
    server,
    port
}
