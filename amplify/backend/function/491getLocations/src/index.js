const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();

exports.handler = async (event) => {
    const params = {
        TableName: 'locations',
        ProjectionExpression: 'coord, locationName', 
    };

    try {
        const data = await dynamoDB.scan(params).promise();

        return {
            statusCode: 200,
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
