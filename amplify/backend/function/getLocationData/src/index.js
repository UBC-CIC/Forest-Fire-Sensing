
const AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    var sensorID = event["queryStringParameters"]['sensorID'];
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const params = {
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
    try {
        const data = await ddb.query(params).promise();
        // TO-DO: get sensor data
        return { statusCode: 200, 
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
               body: JSON.stringify({"satellite": data.Items, "sensor": []}) };
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
