/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash')

exports.handler = (event, context, callback) => {

    var sensorID = event["queryStringParameters"]['sensorID'];
    var lat = event["queryStringParameters"]['lat'];
    var lon = event["queryStringParameters"]['lon'];
    let country = event["queryStringParameters"]['country'];
    let city = event["queryStringParameters"]['city'];
    let province = event["queryStringParameters"]['province'];
    let locationName = event["queryStringParameters"]['locationName'];
    let user = event["queryStringParameters"]['user'];
    let publicLocation = _.get(event, "queryStringParameters.publicLocation", false);
    
    const json = {
        'sensorID': sensorID,
        'lat': lat,
        'lon': lon,
        'country': country,
        'city': city,
        'province': province,
        'locationName': locationName,
        'user': user,
        'publicLocation': publicLocation
    }

    recordData(json).then(() => {
        callback(null, {
            statusCode: 200,
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
        TableName: 'sensors-ampdev',
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

