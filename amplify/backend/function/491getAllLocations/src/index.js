const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();

exports.handler = async (event) => {
    const params = {
        TableName: 'sensors-ampdev',
        ProjectionExpression: 'sensorID, lat, lon, locationName', 
    };

    try {
        const data = await dynamoDB.scan(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(data.Items)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error scanning DynamoDB table' })
        };
    }
};
