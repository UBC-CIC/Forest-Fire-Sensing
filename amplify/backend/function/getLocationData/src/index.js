
const AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    var sensorID = event["queryStringParameters"]['sensorID'];
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const paramsSatellite = {
        TableName: 'satelliteData-ampdev',
        KeyConditionExpression: 'sensorID = :sensorIDVal AND #ts > :currentTs',
        ExpressionAttributeNames: {
            '#ts': 'timestamp' 
        },
        ExpressionAttributeValues: {
            ':sensorIDVal': sensorID,
            ':currentTs': currentTimestamp
        }
    }

    const paramsSensor = {
        TableName: "sensorData-ampdev",
        FilterExpression: '#sensorID = :sensorIDVal',
        ExpressionAttributeValues: {
            ':sensorIDVal': sensorID
        },
        ExpressionAttributeNames: {
            '#sensorID' : 'sensorID'
        }
    };
    try {
        const dataSatellite = await ddb.query(paramsSatellite).promise();
        const dataSensor = await ddb.scan(paramsSensor).promise();
        return { statusCode: 200, 
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
               body: JSON.stringify({"satellite": dataSatellite.Items, "sensor": dataSensor.Items}) };
    } catch (err) {
        return { 
            statusCode: 500, 
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(err) 
        };
    }

};
