/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const SNS = new AWS.SNS();
const cognito = new AWS.CognitoIdentityServiceProvider({ 
    apiVersion: '2016-04-18', 
    region: process.env.AWS_REGION
});

AWS.config.update({
    region: process.env.AWS_REGION
})

function isWithinRegion(regionLat, regionLon, userLat, userLon){
    var dLat = (regionLat - userLat) * Math.PI / 180;
    var dLon = (regionLon - userLon) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(userLat * Math.PI / 180) * Math.cos(regionLat * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    var distance = 6371000 * 2 * Math.asin(Math.sqrt(a));
    console.log(distance);

    return (distance <= 25000);
}

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    var currentDate = new Date();
    var pstDate = currentDate.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles"
    });

    var sensorID = event['queryStringParameters']['sensorID'];

    const params = {
        TableName: 'userSubLocations-ampdev',
        ProjectionExpression: 'username, lat, lon', 
    };

    const deviceParams = {
        TableName: 'sensors-ampdev',
        FilterExpression: '#sensorID = :value',
        ExpressionAttributeValues: {
            ':value': {S: sensorID}
        },
        ExpressionAttributeNames: {
            '#sensorID' : 'sensorID'
        }
    }

    try {
        const data = await dynamoDB.scan(params).promise();
        const deviceData = await dynamoDB.scan(deviceParams).promise();
        console.log(deviceData.Items);

        if(deviceData.Items.length == 0){
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'The device\'s location is not defined, unable to send notifications to users' })
            };
        }

        var deviceLat = deviceData.Items[0].lat.N;
        var deviceLon = deviceData.Items[0].lon.N;
        var isPublic = deviceData.Items[0].publicLocation.BOOL;
        var deviceOwner = deviceData.Items[0].user.S;
        var deviceName = deviceData.Items[0].locationName.S;

        var userEmails = [];
        var userNumbers = [];

        // Retrieve user attributes from cognito
        for(item of data.Items){
            console.log()
            if(isWithinRegion(deviceLat, deviceLon, item.lat.N, item.lon.N) && (isPublic || (deviceOwner === item.username.S))){
                const user = await cognito.adminGetUser({
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: item.username.S
                }).promise();
    
                user.UserAttributes.forEach(attribute => {
                    if(attribute.Name === 'email' && !userEmails.includes(attribute.Value))
                        userEmails.push(attribute.Value)
                    else if(attribute.Name === 'phone_number' && !userNumbers.includes(attribute.Value))
                        userNumbers.push(attribute.Value)
                });
            }
        }

        // Send SMS notifications to users
        const response = await SNS.publish({
            Message: `Fire detected at device ${deviceName}. Location: (${deviceLat}, ${deviceLon}). Detected at ${pstDate}. Please refer to website for more information.`,
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
