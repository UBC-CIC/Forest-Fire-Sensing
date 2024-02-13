
const AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    var lat = event["queryStringParameters"]['lat'];
    var lon = event["queryStringParameters"]['lon'];
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const coord = `${lat}#${lon}`;

    const params = {
        TableName: 'satellite_data',
        KeyConditionExpression: 'coord = :coordVal AND #ts > :currentTs',
        ExpressionAttributeNames: {
            '#ts': 'timestamp' 
        },
        ExpressionAttributeValues: {
            ':coordVal': coord,
            ':currentTs': currentTimestamp
        }
    }
    try {
        const data = await ddb.query(params).promise();
        return { statusCode: 200, 
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
               body: JSON.stringify(data.Items) };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify(err) };
    }

    // TO-DO: get sensor data
};
