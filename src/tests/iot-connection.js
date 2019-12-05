var awsIot = require('aws-iot-device-sdk');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.
//
var device = awsIot.device({
   keyPath: "YourPrivateKeyPath",
  certPath: "YourCertificatePath",
    caPath: "YourRootCACertificatePath",
  clientId: "YourUniqueClientIdentifier",
      host: "a8qqcuirk75wq-ats.iot.us-east-1.amazonaws.com"
});

device.on('connect', () => {
	const topic = "aws/things/esp32/shadow/update";
    console.log(`connect on topic ${topic}`);
    device.publish(topic, JSON.stringify({ robo: true}));
});