/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const _ = require('lodash')
const { CognitoJwtVerifier } = require("aws-jwt-verify");


exports.handler = async (event) => {

  const authToken = event["queryStringParameters"]['authToken']

  console.log(authToken)
  // Verifier that expects valid access tokens:
  const verifier = CognitoJwtVerifier.create({
      userPoolId: "ca-central-1_Rjv5YlAGS",
      tokenUse: "id",
      clientId: "3pb31a4ag8928nkmfjflrb0nc3",
  });
  
  let payload;

  try {
    payload = await verifier.verify(authToken);
  } catch (error) { 
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify(error)
    };
  }

  let user = payload["cognito:username"];

  var sensorID = event["queryStringParameters"]['sensorID'];
  var lat = event["queryStringParameters"]['lat'];
  var lon = event["queryStringParameters"]['lon'];
  let locationName = event["queryStringParameters"]['locationName'];
  let publicLocation = _.get(event, "queryStringParameters.publicLocation", false);

  const item = {
      'sensorID': {'S': sensorID},
      'lat': {'N': lat},
      'lon': {'N': lon},
      'locationName': {'S': locationName},
      'user': {'S': user},
      'publicLocation': {'BOOL': JSON.parse(publicLocation)}
  }

  const params = {
    TableName: 'sensors-ampdev',
    Item: item
  }

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
    return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(error)
    };
  }
};

