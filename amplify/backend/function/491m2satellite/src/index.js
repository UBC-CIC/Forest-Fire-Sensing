

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const https = require('https');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({region: 'ca-central-1'});

exports.handler = async (event, context) => {

  // Fetching data from open api
    var apiKey = "20e23369630f9b6fbf843ee4bfc42fcc";
    var lat = event["queryStringParameters"]["lat"];
    var lon = event["queryStringParameters"]["lon"];
    const apiURL = `https://api.openweathermap.org/data/2.5/fwi/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log(apiURL);
    var p = new Promise((resolve, reject) => {
    https.get(apiURL, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject('Error parsing JSON: ' + error.message);
        }
      });
    }).on('error', (error) => {
      reject('Error making request: ' + error.message);
    });
  });
  var jsonData = await p;

  console.log(jsonData)

  // Invoke 491m2write
  const params = {
    FunctionName: '491m2write-ampdev',
    InvocationType: 'RequestResponse',
    LogType: 'None',
    Payload: JSON.stringify(jsonData)
  };
  const response = await lambda.invoke(params).promise();
  if(response.StatusCode !== 200){
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Error Writing data' })
    };
  }

  // Return success
      return {
        statusCode: 200,
        headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(jsonData),
    };
};