/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const _ = require('lodash')

exports.handler = async (event) => {

    var sensorID = event["queryStringParameters"]['sensorID'];
    var lat = event["queryStringParameters"]['lat'];
    var lon = event["queryStringParameters"]['lon'];
    let country = event["queryStringParameters"]['country'];
    let city = event["queryStringParameters"]['city'];
    let province = event["queryStringParameters"]['province'];
    let locationName = event["queryStringParameters"]['locationName'];
    let user = event["queryStringParameters"]['user'];
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

