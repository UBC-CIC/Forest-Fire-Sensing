/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const _ = require('lodash');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({region: 'ca-central-1'});

exports.handler = async (event) => {
    const params = {
        FunctionName: '491getAllLocations-ampdev',
        InvocationType: 'RequestResponse',
        LogType: 'None'
      };
      const response = await lambda.invoke(params).promise();
      if(response.StatusCode !== 200){
        return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
             },
            body: JSON.stringify({ message: 'Error getting locations' })
          };
      }

      var paramsWrite = {
        FunctionName: '491m2satellite-ampdev',
        InvocationType: 'RequestResponse',
        LogType: 'None'
      };

      const data = _.get(response, 'Payload', []);

      const dataItems = JSON.parse(data).body;
      console.log("get locations: ", dataItems);

      function sleep(ms) {
        console.log(Date.now());
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      for (const element of JSON.parse(dataItems)) {
        await sleep(1000); // Ensures a 1-second delay between each iteration
        var coord = _.get(element, 'coord.S', '');
        console.log(coord);
      
        if (coord !== '') {
          let payload = {
            "queryStringParameters": {
              "lat": coord.split('#')[0],
              "lon": coord.split('#')[1]
            }
          };
          paramsWrite['Payload'] = JSON.stringify(payload);

          try {
            var res = await lambda.invoke(paramsWrite).promise();

            if (res.StatusCode !== 200) {
              console.log("error fetch and write data ", coord)
              return {
                  statusCode: 500,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                   },
                  body: JSON.stringify({ message: 'Error fetch and write data' })
              };
            }
          } catch (error) {
            console.log("error fetch and write data ", coord)
              return {
                  statusCode: 500,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                   },
                  body: JSON.stringify({ message: 'Error fetch and write data' })
              };
          }
        }
      };


      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' }),
        headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*"
        }
    };
};