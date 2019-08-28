const server = require('../config/server').server
const port = require('../config/server').port
const router = require('../routes/router')

require('dotenv').config()

server.listen(port, (router) => {
	console.log('Server started at port ' + port)
})