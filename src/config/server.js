const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')
const helmet = require('helmet')
const server = restify.createServer()

server.use(helmet())

const cors = corsMiddleware({
	origins: ['*'],
	allowHeaders: ['*'],
	exposeHeaders: ['*']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser({
	mapParams: true
}))

module.exports.server = server
