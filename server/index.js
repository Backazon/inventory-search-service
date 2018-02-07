
const express = require('express')
const app = express()
const assert = require('assert')
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const CronJob = require('cron').CronJob;

const newItemQueue = require('./newItemQueue.js')

// REDIS DATABASE
const redis = require('redis')
var redisClient = redis.createClient()
redisClient.on('error', (err) => console.log('Redic Client Error: ', err))


// INVENTORY DATABASE
const MongoClient = require('mongodb').MongoClient
var db, inventory, server

//connect to MongoDB on start
MongoClient.connect('mongodb://localhost:27017/backazon', (err, client) => {
  if (err) {
    console.log('Unable to connect to Mongo')
    process.exit(1)
  } else {
    db = client.db('backazon')
    inventory = db.collection('inventory')

    // // mongo text index
    // inventory.ensureIndex({ name: "text", description: "text", category: "text", subcategory: "text", department: "text"}, {name: "InventoryTextIndex"})

    server = app.listen(3000, function() {
      console.log('Listening on port 3000...')
    })
  }
})

// REQUEST HANDLERS

/***************************************************************************
Update trending items in Redis cache on daily basis
*/
const cronjob = new CronJob({
  cronTime: '00 00 00 * * *',
  onTick: () => {
    console.log('Executing Cron Job', new Date())
    inventory
      .find({})
      .sort({ avg_rating: -1, review_count: -1 })
      .limit(3000)
      .toArray((err, result) => {
        if (err) throw err
        console.log('Cron job successful', new Date())
        redisClient.set('trending', JSON.stringify(result))
      })
  }, 
  start: true,
  timeZone: 'America/Los_Angeles'
})
console.log('cronjob status', cronjob.running)
// app.get('/refresh', (req, res) => {
//   inventory
//     .find({})
//     .sort({ avg_rating: -1, review_count: -1 })
//     .limit(3000)
//     .toArray((err, result) => {
//       if (err) throw err
//       redisClient.set('trending', JSON.stringify(result))
//       res.sendStatus(200)
//     })
// })

/***************************************************************************
 GET request to '/trending', when client visits Backazon homepage,
 or when filter/analytics request trending items
 Response object: { [ summarized item objects ] }
*/
app.get('/trending', (req, res) => {
  redisClient.get('trending', (err, results) => {
    console.log('Redis trending results:', JSON.parse(results))
    err ? res.sendState(500) : res.status(200).send(JSON.parse(results))
  })
})

/***************************************************************************
TODO: send update to user analytics, format:
  {
    UserID    : 123,
    ProductID : 123,
    Viewed    : Boolean,
    Clicked   : Boolean,
    Purchased : Boolean,
    Cart      : Boolean,
    Wishlist  : Boolean,
    Timestamp : dateTime
  }
GET request to '/details', when client clicks on product for more info
Request object:   { item_id: number }
Response object:  { full item details object }
*/
app.get('/details', (req, res) => {
  redisClient.get(req.query.item_id, (err, result) => {
    if (result) {
      console.log('Returned from Redis Cache')
      res.send(JSON.parse(result))
    } else {
      inventory.findOne({ item_id: parseInt(req.query.item_id) }, (err, doc) => {
        if (err) res.status(400).json('Could not find item')

        assert.equal(null, err)
        assert.ok(doc != null)

        redisClient.set(req.query.item_id, JSON.stringify(doc))
        res.status(200).send(doc)
      })
    }
  })
})

/***************************************************************************
POST request to '/submitItem', when client submits new item to be hosted on Backazon
GET request to '/newItems', when ready to pull new items from queue & add to inventory
Request from client: 
  {
    "item_id": 53,
    "name": "test",
    "description": "test",
    "price": 0,
    "color": "test",
    "size": "test",
    "image_url": "test.png",
    "category": "test",
    "subcategory": "test",
    "department": "test"
  }
Response: 200
*/

//USING MESSAGE QUEUE
// AMAZON SQS
// https://sqs.us-east-2.amazonaws.com/301033191252/backazon-new-items

// takes user submitted info and adds item to queue
app.post('/submitItem', (req, res) => {

  var newItem = {
    item_id: parseInt(req.body.item_id),
    name: req.body.name,
    description: req.body.description,
    price: parseInt(req.body.price),
    color: req.body.color,
    size: req.body.size,
    inventory: 100,
    avg_rating: 0,
    review_count: 0,
    image_url: req.body.image_url,
    category: req.body.category,
    subcategory: req.body.subcategory,
    department: req.body.department,
    creation_date: new Date()
  }

  newItemQueue.enqueue(newItem)
  res.status(200).send('Item successfully submitted')
}) 

// TODO: how often to check queue for new items??
//retrieve new items from queue and insert to inventory db
app.get('/newItems', (req, res) => {

  while(newItemQueue.hasItems) {
    let nextItem = newItemQueue.dequeue();
    console.log(nextItem)

    inventory.insertOne(nextItem, (err, result) => {
      assert.equal(null, err)
      assert.equal(1, result.insertedCount)

      res.status(200).send('New item successfully added')
    })
  }

})

// WITHOUT USING MESSAGE QUEUE
// app.post('/newitem', (req, res) => {

//   var newItem = {
//     item_id: parseInt(req.body.item_id),
//     name: req.body.name,
//     description: req.body.description,
//     price: parseInt(req.body.price),
//     color: req.body.color,
//     size: req.body.size,
//     inventory: 100,
//     avg_rating: 0,
//     review_count: 0,
//     image_url: req.body.image_url,
//     category: req.body.category,
//     subcategory: req.body.subcategory,
//     department: req.body.department,
//     creation_date: new Date()
//   }

//   inventory.insertOne(newItem, (err, result) => {
//     assert.equal(null, err)
//     assert.equal(1, result.insertedCount)

//     res.status(200).send('New item successfully added')
//   })
// })

/***************************************************************************
POST request to '/sales', when orders service receives new sales transaction
  Request object from orders service: 
    data: [ 
            { userid: 1, itemid: 4476, qty: 5, rating: 1 },
            { userid: 1, itemid: 4463, qty: 3, rating: 3 } 
          ]
  Response status: 200
*/
app.post('/sales', (req, res) => {

  var soldItems = req.body.items 

  for (var i = 0; i < soldItems.length; i++) {
    let itemId = soldItems[i].itemid
    let qtySold = soldItems[i].qty

    inventory.updateOne({ item_id: parseInt(itemId) }, { $inc: { inventory: -(parseInt(qtySold)) } }, (err, result) => {
      assert.equal(null, err)
      assert.equal(1, result.result.nModified)
    })
  }
  res.status(200).send('Inventory successfully updated')
})

/***************************************************************************
TODO: send update to user analytics

GET request to '/department', when client clicks on category/department
Request from client:  { query: string }
Response object:      { [ summarized item objects ] }
*/
app.get('/department', (req, res) => {
  
  var dept = req.query.department
  
  redisClient.get(dept, (err, results) => {
    if (results) {
      console.log('Recent dept search returned from cache')
      res.status(200). send(JSON.parse(results))
    } else {
      inventory
        .find({ department: JSON.parse(dept) })
        .sort({ avg_rating: -1, review_count: -1 })
        .limit(100)
        .toArray((err, results) => {
          if (err) throw err
          redisClient.set(department, JSON.stringify(results))
          res.status(200).send(results)
        })
    }
  })
})

/***************************************************************************
TODO; elastic search auto-suggestions?
TODO: send update to user analytics (TBD - check with Ben on format)

GET request to '/search', when client submits search query in search box
Request from client:  { query: string }
Response object:      { [ summarized item objects ] }
*/
app.get('/search', (req, res) => {
  //TODO: store recent search results in cache & query first
  var query = req.query.search

  redisClient.get(query, (err, results) => {
    if (results) {
      console.log('Recent search returned from cache')
      res.status(200).send(JSON.parse(results))
    } else {
      inventory
        .find({ $text: { $search: query } })
        .sort({ avg_rating: -1, review_count: -1 })
        .limit(100)
        .toArray((err, results) => {
          if (err) throw err
          redisClient.set(query, JSON.stringify(results))
          res.status(200).send(results)
        })
    }
  })
})

