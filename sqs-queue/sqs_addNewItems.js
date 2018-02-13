const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-2' })

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const credentials = new AWS.SharedIniFileCredentials({profile: 'default'})
AWS.config.credentials = credentials

const queueURL = 'https://sqs.us-east-2.amazonaws.com/301033191252/backazon-new-items'

const params = {
  DelaySeconds: 10,
  MessageAttributes: {
    "item_id": {
      DataType: "Number",
      StringValue: "20000001"
    },
    "name": {
      DataType: "String",
      StringValue: "Test Product"
    },
    "description": {
      DataType: "String",
      StringValue: "Test"
    },
    "price": {
      DataType: "Number",
      StringValue: "100"
    },
    "color": {
      DataType: "String",
      StringValue: "Test"
    },
    "size": {
      DataType: "String",
      StringValue: "Test"
    },
    "image_url": {
      DataType: "String",
      StringValue: "test.png"
    },
    "category": {
      DataType: "String",
      StringValue: "Test"
    },
    "subcategory": {
      DataType: "String",
      StringValue: "Test"
    },
    "department": {
      DataType: "String",
      StringValue: "Test"
    }
  },
  MessageBody: "New item submitted",
  QueueUrl: queueURL
}

sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log("Error", err)
  } else {
    console.log("Success", data.MessageId)
  }
})