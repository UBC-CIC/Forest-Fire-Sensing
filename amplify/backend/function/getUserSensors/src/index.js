/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    let name = "";
    if (event.requestContext.authorizer) {
        console.log(`CLAIMS: `, event.requestContext.authorizer.claims);
        name = event.requestContext.authorizer.claims["cognito:username"];
    }

    if (name === "")
        return {
            statusCode: 401,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify("Invalid Authorization: Does not contain username")
        };

    const params = {
        TableName: "locations-ampdev",
        FilterExpression: '#user = :username',
        ExpressionAttributeValues: {
            ':username': {S: name}
        },
        ExpressionAttributeNames: {
            '#user' : 'user'
        }
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
