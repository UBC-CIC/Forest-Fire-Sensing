/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const { CognitoJwtVerifier } = require("aws-jwt-verify");


exports.handler = async (event) => {
    const authToken = event.headers['Authorization']
    console.log(authToken)
    // Verifier that expects valid access tokens:
    const verifier = CognitoJwtVerifier.create({
        userPoolId: "ca-central-1_Rjv5YlAGS",
        tokenUse: "id",
        clientId: "3pb31a4ag8928nkmfjflrb0nc3",
    });
    
    let payload;
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    };

    try {
        payload = await verifier.verify(authToken);
    } catch (error) { 
        return {
        statusCode: 401,
        headers: headers,
        body: JSON.stringify(error)
        };
    }

    let name = payload["cognito:username"];

    const params = {
        TableName: "sensors-ampdev",
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
            headers: headers,
            body: JSON.stringify(data.Items)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify(err)
        };
    }
};
