

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const _ = require('lodash');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({region: 'ca-central-1'});

exports.handler = async (event) => {
    const params = {
        FunctionName: '491getLocations-ampdev',
        InvocationType: 'RequestResponse',
        LogType: 'None'
      };
      const response = await lambda.invoke(params).promise();
      if(response.StatusCode !== 200){
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error getting locations' })
          };
      }

      var paramsWrite = {
        FunctionName: '491m2satellite-ampdev',
        InvocationType: 'RequestResponse',
        LogType: 'None'
      };

      const data = _.get(response, 'Payload', []);
      console.log(data)
      console

      data.forEach(async element => {
        var coord = _.get(element, 'coord.S', '');
        if(coord != ''){
            payload = { "queryStringParameters": { "lat": coord.split('#')[0], "lon": coord.split('#')[1] } };
            paramsWrite['Payload'] = JSON.stringify(payload);

            var res = await lambda.invoke(paramsWrite).promise();
            if(res.StatusCode !== 200){
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Error getting location data' })
                };
            }
        }
      });

      return {
        statusCode: 200,
        headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(data),
    };
};
