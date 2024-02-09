/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    var lat = event["queryStringParameters"]['lat'];
    var lon = event["queryStringParameters"]['lon'];
    let country = event["queryStringParameters"]['country'];
    let city = event["queryStringParameters"]['city'];
    let province = event["queryStringParameters"]['province'];
    let locationName = event["queryStringParameters"]['locationName'];

    const json = {
        'coord': `${lat}#${lon}`,
        'country': country,
        'city': city,
        'province': province,
        'locationName': locationName,
    }

    recordData(json).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify(json),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};


function recordData(json) {
    return ddb.put({
        TableName: 'locations',
        Item: json,
    }).promise();
}


function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
  });
}

