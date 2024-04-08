
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

  var username = event["queryStringParameters"]['username'];
  var lat = event["queryStringParameters"]['lat'];
  var lon = event["queryStringParameters"]['lon'];
  var createTime = Date.now().toString();

  const item = {
      'username': {'S': username},
      'createTime': {'N': createTime},
      'lat': {'N': lat},
      'lon': {'N': lon},
  }

  const params = {
    TableName: 'userSubLocations-ampdev',
    Item: item
  }

  const errorReturnVal = (errMsg) => {return {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    body: errMsg
  };}

  try {
    const response = await dynamoDB.putItem(params).promise();

    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify(response)
  };
  } catch(error) {
    console.error(error);
    return errorReturnVal;
  }
};