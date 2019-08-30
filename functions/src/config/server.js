// const restify = require('restify')
// const corsMiddleware = require('restify-cors-middleware')
const compresison = require('compression')
const helmet = require('helmet')
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({ origin: true }))

// const server = restify.createServer()

app.use(helmet())

// const cors = corsMiddleware({
// 	origins: ['*'],
// 	allowHeaders: ['*'],
// 	exposeHeaders: ['*']
// })

app.use(compresison())

// server.pre(cors.preflight)
// server.use(cors.actual)

// server.use(restify.plugins.bodyParser())
// server.use(restify.plugins.queryParser({
// 	mapParams: true
// }))
module.exports.server = app
exports.app = functions.https.onRequest(app);
