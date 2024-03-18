/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();

exports.handler = async (event) => {
    var protobuf = require("protobufjs");
    var fs = require('fs');
    console.log(`EVENT: ${JSON.stringify(event)}`);

    var sensorID = event["end_device_ids"]["dev_eui"];
    var timestamp = event["uplink_message"]["rx_metadata"][0]["timestamp"];
    var payload = event["uplink_message"]["frm_payload"];
    let message;
    let root;

    try {
        var proto = fs.readFileSync('message.proto');
        root = protobuf.parse(proto.toString(), {keepCase: true}).root;
    } catch(error) {
        return {
            statusCode: 401,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(error)
          };
    }

    var Message = root.lookupType("Message");
    var buffer = Buffer.from(payload, 'base64');
    message = Message.decode(buffer);

    const item = {
        'sensorID': {'S': sensorID},
        'timestamp': {'N': timestamp.toString()},
        'temperature': {'N': message['temperature'].toString()},
        'humidity': {'N': message['humidity'].toString()},
        'pressure': {'N': message['pressure'].toString()},
        'gas_resistence': {'N': message['gas_resistence'].toString()} 
    };

    const params = {
        TableName: 'sensorData-ampdev',
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

}