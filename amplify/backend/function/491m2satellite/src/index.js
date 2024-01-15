

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const https = require('https');

exports.handler = async (event, context) => {
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
      return {
        statusCode: 200,
        headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(jsonData),
    };
};
