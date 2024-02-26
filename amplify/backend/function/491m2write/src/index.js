/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

  const sensorID = event['sensorID']
  const dataList = event['data']['list'];

  const itemsToInsert = dataList.map((dataItem, index) => {
    const dt = dataItem['dt'];
    const fwi = dataItem['main']['fwi'];
    const danger_description = dataItem['danger_rating']['description'];
    const danger_value = dataItem['danger_rating']['value'];

    return {
        PutRequest: {
            Item: {
                'sensorID': sensorID,
                'timestamp': parseInt(dt),
                'fwi': fwi,
                'danger_description': danger_description,
                'danger_value': danger_value,
                'update_time': Date.now()
            }
        }
    };
  });
  const params = {
    RequestItems: {
        'satelliteData-ampdev': itemsToInsert
    }
  };

  recordData(params).then(() => {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
        },
    });
  }).catch((err) => {
    console.error(err);
    errorResponse(err.message, context.awsRequestId, callback);
  });
};

function recordData(params) {
  return ddb.batchWrite(params).promise();
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
