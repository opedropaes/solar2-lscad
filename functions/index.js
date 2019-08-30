const functions = require('firebase-functions');

const server = require('./src/config/server').server
const port = process.env.PORT || 3000
const router = require('./src/routes/router')

server.listen(port, (router) => {
	console.log('Server started at port ' + port)
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
