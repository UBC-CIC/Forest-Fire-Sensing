/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_SATELLITEDATA_ARN
	STORAGE_SATELLITEDATA_NAME
	STORAGE_SATELLITEDATA_STREAMARN
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    var sensorID = event["queryStringParameters"]["sensorID"];

    const errorReturnVal = (errMsg) => {return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: errMsg
      };}

    console.log(sensorID)

    const queryParams = {
        TableName: 'satelliteData-ampdev',
        KeyConditionExpression: 'sensorID = :sensorID',
        ExpressionAttributeValues: {
            ':sensorID': sensorID
        }
    };

    async function deleteItems(items) {
        for (const item of items) {
            const deleteParams = {
                TableName: 'satelliteData-ampdev',
                Key: {
                    'sensorID': item.sensorID,
                    'timestamp': item.timestamp 
                }
            };
            const deleteData = await ddb.delete(deleteParams).promise();
            console.log("DeleteItem succeeded:", JSON.stringify(deleteData));
        }
    }

    try{
        const res = await ddb.query(queryParams).promise();
        await deleteItems(res.Items);
    }catch(err){
        return errorReturnVal(JSON.stringify(err));
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify('seccess delete'),
    };
};
