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
const lambda = new AWS.Lambda({region: process.env.AWS_REGION});


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

  var user = name
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

