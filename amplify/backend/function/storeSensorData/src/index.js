/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    var protobuf = require("protobufjs");
    var fs = require('fs');
    console.log(`EVENT: ${JSON.stringify(event)}`);

    var sensorID = event["end_device_ids"]["dev_eui"];
    var time = event["uplink_message"]["rx_metadata"][0]["received_at"];
    var payload = event["uplink_message"]["frm_payload"];
    let message;
    let root;

    var timestamp = new Date(time).getTime();

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
    
    var result = await lambda.invoke({
        FunctionName: 'FireDetectionModelStack-fireDetectionModelE3DD7B9A-RIrWxa7LYXiO',
        Payload: JSON.stringify([message['temperature'], message['humidity'], message['voc'], message['co_2'], message['pressure']])
    }).promise();
    
    var fireResult = JSON.parse(result['Payload']);
    var isFire = (fireResult['body'] === "0") ? false : true;
    
    const item = {
        'sensorID': {'S': sensorID},
        'timestamp': {'N': timestamp.toString()},
        'temperature': {'N': message['temperature'].toString()},
        'humidity': {'N': message['humidity'].toString()},
        'pressure': {'N': message['pressure'].toString()},
        'co_2': {'N': message['co_2'].toString()},
        'voc': {'N': message['voc'].toString()},
        'temperature_2': {'N': message['temperature_2'].toString()},
        'humidity_2': {'N': message['humidity_2'].toString()},
        'pressure_2': {'N': message['pressure_2'].toString()},
        'co_2_2': {'N': message['co_2_2'].toString()},
        'voc_2': {'N': message['voc_2'].toString()},
        'isFire': {'BOOL': isFire}
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