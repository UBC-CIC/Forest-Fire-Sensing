/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    var data_id = event["queryStringParameters"]["data_id"];
    var lat = event["queryStringParameters"]['lat'];
    var lon = event["queryStringParameters"]['lon'];
    let dt = event["queryStringParameters"]['dt'];
    let fwi = event["queryStringParameters"]['fwi'];
    let danger_description = event["queryStringParameters"]['danger_description'];
    let danger_value = event["queryStringParameters"]['danger_value'];

    const json = {
      'data_id': data_id,
      'lat': lat,
      'lon': lon,
      'dt': dt,
      'fwi': fwi,
      'danger_description': danger_description,
      'danger_value': danger_value,
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
        TableName: 'satellite_data',
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


