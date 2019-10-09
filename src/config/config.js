const AWS = require('aws-sdk')

AWS.config.region = 'us-east-1'
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:52bffe11-4e2e-4b34-8d21-4ea948340b2c',
})

const docClient = new AWS.DynamoDB.DocumentClient()

module.exports.docClient = docClient
