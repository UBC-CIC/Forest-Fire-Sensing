/* Amplify Params - DO NOT EDIT
	ENV
	FUNCTION_491M2SATELLITE_NAME
	FUNCTION_DELETESENSORDATA_NAME
	REGION
	STORAGE_SATELLITEDATA_ARN
	STORAGE_SATELLITEDATA_NAME
	STORAGE_SATELLITEDATA_STREAMARN
	STORAGE_SENSORS_ARN
	STORAGE_SENSORS_NAME
	STORAGE_SENSORS_STREAMARN
Amplify Params - DO NOT EDIT *//**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const _ = require('lodash')
const lambda = new AWS.Lambda({region: 'ca-central-1'});
const { CognitoJwtVerifier } = require("aws-jwt-verify");


exports.handler = async (event) => {

  const authToken = event.headers['Authorization']
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
    
    // delete previous sensor data 
    const deletParams = {
      FunctionName: 'deleteSensorData-ampdev',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        "queryStringParameters": {
          'sensorID': sensorID
        }
    })};

    var deleteRes = await lambda.invoke(deletParams).promise();
    if(deleteRes.StatusCode !== 200){
      return errorReturnVal(JSON.stringify({ message: 'Error detele previous sensor data' }));
    }

    // add new data 
    const satelliteParams = {
      FunctionName: '491m2satellite-ampdev',
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify({
        "queryStringParameters": {
          'sensorID': sensorID,
          "lat":lat,
          "lon": lon
        }
    })};

    var res = await lambda.invoke(satelliteParams).promise();
    if(res.StatusCode !== 200){
      console.log('res', res)
      return errorReturnVal(JSON.stringify({ message: 'Error fetch new sensor data' }));
    }

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

