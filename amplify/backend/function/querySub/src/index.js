/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_USERSUBLOCATIONS_ARN
	STORAGE_USERSUBLOCATIONS_NAME
	STORAGE_USERSUBLOCATIONS_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();

exports.handler = async (event) => {
    let name = "";
    if (event.requestContext.authorizer) {
        console.log(`CLAIMS: `, event.requestContext.authorizer.claims);
        name = event.requestContext.authorizer.claims["cognito:username"];
    }

    let headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    };

    if (name === "")
        return {
            statusCode: 401,
            headers: headers,
            body: JSON.stringify("Invalid Authorization: Does not contain username")
        };

    const username = 'abc'
    const params = {
        TableName: 'userSubLocations-ampdev',
        ProjectionExpression: 'username, createTime, lat, lon', 
        FilterExpression: '#username = :username',
        ExpressionAttributeNames: {
            '#username': 'username',
        },
        ExpressionAttributeValues: {
            ':username': {S: username},
        },
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
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Error scanning DynamoDB table' })
        };
    }
};
