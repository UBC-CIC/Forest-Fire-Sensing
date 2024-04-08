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


    // Pick the "worse" value between the sensors 
    // Better to get a false positive rather than a false negative
    var tempToSend = (message['temperature'] > message['temperature_2']) ? message['temperature'] : message['temperature_2'];
    var humidityToSend = (message['humidity'] > message['humidity_2']) ? message['humidity'] : message['humidity_2'];
    var vocToSend = (message['voc'] > message['voc_2']) ? message['voc'] : message['voc_2'];
    var co_2ToSend = (message['co_2'] > message['co_2_2']) ? message['co_2'] : message['co_2_2'];
    var pressureToSend = (message['pressure'] > message['pressure_2']) ? message['pressure'] : message['pressure_2'];
    
    // Invoke lambda function to predict if there's a fire based on sensor values
    var result = await lambda.invoke({
        FunctionName: 'FireDetectionModelStack-fireDetectionModelE3DD7B9A-RIrWxa7LYXiO',
        Payload: JSON.stringify([tempToSend, humidityToSend, vocToSend, co_2ToSend, pressureToSend])
    }).promise();
    
    var fireResult = JSON.parse(result['Payload']);
    var isFire = (fireResult['body'] === "0") ? false : true;

    // Notify users in case of fire
    if(isFire){
        const notificationParams = {
            FunctionName: 'notificationTrigger-ampdev',
            InvocationType: 'Event',
            LogType: 'None',
            Payload: JSON.stringify({
              "queryStringParameters": {
                'sensorID': sensorID
              }
          })};

        var response = lambda.invoke(notificationParams).promise();
    }
    
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