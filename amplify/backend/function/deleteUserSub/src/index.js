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
AWS.config.update({region: process.env.AWS_REGION});
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    console.log(`EVENT: ${JSON.stringify(event)}`);
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

    var username = name;
    var createTime = event["queryStringParameters"]["createTime"];

    const errorReturnVal = (errMsg, statusCode = 500) => {
        return {
            statusCode: statusCode,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: errMsg
        };
    };

    const deleteParams = {
        TableName: 'userSubLocations-ampdev',
        Key: {
            'username': username,
            'createTime': parseInt(createTime, 10) // Assuming createTime is a number and should be parsed as Integer.
        }
    };

    try {
        // Perform the delete operation and await its completion
        await ddb.delete(deleteParams).promise();
        
        // If delete is successful, return success message
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify('Success delete'),
        };
    } catch (err) {
        // If there's an error, return an error message
        console.error("Error", err);
        return errorReturnVal(JSON.stringify(err));
    }
};
