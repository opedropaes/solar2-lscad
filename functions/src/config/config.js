const AWS = require('aws-sdk')

AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:52bffe11-4e2e-4b34-8d21-4ea948340b2c',
});

const config = AWS.config.credentials.get(function (err) {
    if (err) {
        console.log("Error: " + err);
        return;
    }

    // console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
    var cognitoSyncClient = new AWS.CognitoSync();

    cognitoSyncClient.listDatasets({
        IdentityId: AWS.config.credentials.identityId,
        IdentityPoolId: 'us-east-1:52bffe11-4e2e-4b34-8d21-4ea948340b2c'
    }, function (err, data) {
        if (!err) {
            console.log(JSON.stringify(data));
        }
    })
});

const docClient = new AWS.DynamoDB.DocumentClient()

module.exports.docClient = docClient;