/* Amplify Params - DO NOT EDIT
	API_APIB7C99001_APIID
	API_APIB7C99001_APINAME
	AUTH_491M2PROTOTYPE_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const SNS = new AWS.SNS();
const cognito = new AWS.CognitoIdentityServiceProvider({ 
    apiVersion: '2016-04-18', 
    region: 'ca-central-1'
});

AWS.config.update({
    region: 'ca-central-1'
})

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const params = {
        TableName: 'userSubLocations-ampdev',
        ProjectionExpression: 'username, lat, lon', 
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        var userEmails = [];
        var userNumbers = [];

        // Maybe switch over to storing email/phone numbers directly in dynamoDB if privacy/security concerns not an issue
        // Retrieve user attributes from cognito
        // TODO: filter out users who are outside the region (currently adding everyone)
        console.log(data);
        for(item of data.Items){
            console.log(item);
            const user = await cognito.adminGetUser({
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: item.username.S
            }).promise();

            user.UserAttributes.forEach(attribute => {
                if(attribute.Name === 'email')
                    userEmails.push(attribute.Value)
                else if(attribute.Name === 'phone_number')
                    userNumbers.push(attribute.Value)
            });
        }

        // Subscribe email and phone number to topic
        // Proof of concept; should be done before when user adds notification (should also be way to check if user is already verified)
        /*for(var i = 0; i < userEmails.length; i++){
            var smsParams = {
                Protocol: 'sms',
                TopicArn: process.env.SNS_TOPIC_ARN,
                Endpoint: userNumbers[i]
            }
            var emailParams = {
                Protocol: 'email',
                TopicArn: process.env.SNS_TOPIC_ARN,
                Endpoint: userEmails[i]
            }

            var responseSMS = await SNS.subscribe(smsParams).promise();
            var responseEmail = await SNS.subscribe(emailParams).promise();
            console.log(responseSMS);
            console.log(responseEmail);
        }*/

        // Send SMS notifications to users
        const response = await SNS.publish({
            Message: 'There\'s a fire! TODO: insert location',
            TargetArn: process.env.SNS_TOPIC_ARN,
            MessageAttributes: {
                sms: {
                    DataType: 'String.Array',
                    StringValue: JSON.stringify(userNumbers)
                },
                email: {
                    DataType: 'String.Array',
                    StringValue: JSON.stringify(userEmails)
                }
            }
        }).promise();
        console.log(response);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Notifications sent' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error sending notifications' })
        };
    }
};
