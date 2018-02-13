const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-2'})

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const queueURL = 'https://sqs.us-east-2.amazonaws.com/301033191252/backazon-new-items'

const inventory = require('../database/mongo')

const params = {
  AttributeNames: [
    "item_id",
    "name",
    "description",
    "price",
    "color",
    "size",
    "image_url",
    "category",
    "subcategory",
    "department",
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    "All"
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0
}

const getMessage = () => {
  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      console.log("Error", err)
    } else if (data.Messages) {
  
      let itemMessage = data.Messages[0].MessageAttributes
      let newItem = {
        item_id: parseInt(itemMessage.item_id.StringValue),
        name: itemMessage.name.StringValue,
        description: itemMessage.description.StringValue,
        price: parseInt(itemMessage.price.StringValue),
        color: itemMessage.color.StringValue,
        size: itemMessage.size.StringValue,
        inventory: 100,
        avg_rating: 0,
        review_count: 0,
        image_url: itemMessage.image_url.StringValue,
        category: itemMessage.category.StringValue,
        subcategory: itemMessage.subcategory.StringValue,
        department: itemMessage.department.StringValue,
        creation_date: new Date()
      }
      inventory.insertNewItem(newItem, (err) => {
        if (err) {
          callback(err)
        }
      })
      
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      }
      sqs.deleteMessage(deleteParams, (err, data) => {
        if (err) {
          console.log("SQS Delete Error", err)
        } else {
          console.log("SQS Message Deleted", data)
        }
      }) 
    }
  })
}

module.exports = {
  getMessage
}