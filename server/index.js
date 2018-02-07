
const express = require('express')
const app = express()
const assert = require('assert')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// const inventorydb = require('../databases/mongo-inventory')


// REDIS DATABASE

const redis = require('redis')
var redisClient = redis.createClient()
redisClient.on('error', (err) => console.log('Redic Client Error: ', err))

// Test Redis DB
// check in terminal: $ redis-cli ping

// redisClient.set('test key2', ['test value', 'testval2'], redis.print)
// redisClient.get('test key2', (err, result) => {
//   err ? console.log('Redis Error:', err) : console.log('GET results => ', result)
// }) 


// INVENTORY DATABASE

// const inventoryDb = require('../databases/mongo-inventory/index.js')
const MongoClient = require('mongodb').MongoClient
var db, inventory, server
// const departments = require('../databases/mongo-inventory/dataGenerator.js')

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



/***************************************************************************
TODO: Update trending items in Redis cache on daily basis

// get trending items
*/
app.get('/refresh', (req, res) => {
  // NATIVE
  inventory
    .find({})
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(3000)
    .toArray((err, result) => {
      if (err) throw err
      redisClient.set('trending', JSON.stringify(result))
      res.sendStatus(200)
    })

  // MONGOOSE
  // inventorydb.getTrendingItems((err, data) => {
  //   if (err) {
  //     console.log('Error updating trending items cache', err)
  //   } else {
  //     console.log('trending data:', data)
  //     redisClient.set('trending', data, redis.print)
  //   }
  // })
})

/***************************************************************************
 GET request to '/trending', when client visits Backazon homepage,
 or when filter/analytics request trending items

 Response object:
 { [ summarized item objects ] }
  */
app.get('/trending', (req, res) => {
    
  // NATIVE
  // inventory
  //   .find({ })
  //   .sort({ avg_rating: -1, review_count: -1 })
  //   .limit(3000)
  //   .toArray((err, result) => {
    //     if (err) throw err
    //     console.log(result)
    //     res.status(200).send(result)
    //   })
    
    // MONGOOSE
    // inventorydb.getTrendingItems((err, data) => {
      //   err ? res.sendStatus(500) : res.status(200).send(data)
      // })
      
    // **REDIS CACHE**
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
Request object from client:
{
  userId: 000000,
  itemId: 000000
}
Response object: 
{
  { full item details object }
}
*/
app.get('/details', (req, res) => {

  //NATIVE MONGO
  // var itemId = parseInt(req.query.item_id)
  
  // inventory.findOne({item_id: itemId}, (err, doc) => {
  //   if (err) res.status(400).json('Could not find item')

  //   assert.equal(null, err)
  //   assert.ok(doc != null)

  //   res.status(200).send(doc)
  // })

  //MONGOOSE
  // inventorydb.getItemDetails(req.query.item_id, (err, data) => {
  //   err ? res.sendStatus(500) : res.status(200).send(data)
  // })

  //check redis cache first, if found return, else pull from mongo, return and store in redis
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
TODO: move to queue (will require GET from queue request)

POST request to '/newitem', when client submits new item to be hosted on Backazon
  Request object from client: 
    {
      { full product details }
    }
  Response status: 200
*/
app.post('/newitem', (req, res) => {

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

  inventory.insertOne(newItem, (err, result) => {
    assert.equal(null, err)
    assert.equal(1, result.insertedCount)

    res.status(200).send('New item successfully added')
  })

  //CHECK THAT THESE ARE ADDED TO THE INVENTORY DB
  // inventorydb.addItemToInventory(newItem, (err, data) => {
  //   err ? res.sendStatus(500) : res.status(200).send('New item successfully added')
  // })
})

/***************************************************************************
POST request to '/sales', when orders service receives new sales transaction
  Request object from orders service: 
    data: {
      userid: #,
      items: [
      {itemid:123, qty:2, rating: 4},
      {itemid:1234, qty:1, rating: 5}
      ]
    }
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
    // inventorydb.updateInventory(itemId, qtySold, (err, data) => {
    //   err ? console.log(err) : undefined
    // })

  }
  res.status(200).send('Inventory successfully updated')

  //TESTING
  //get item's initial inventory 
  //run update query
  //check new inventory against original 
})

/***************************************************************************
TODO: move in ElasticSearch or query from cache?
TODO: send update to user analytics

GET request to '/department', when client clicks on category/department
Request object from client:
{
  query: category/brand/department string
}
Response object: 
{
  [ summarized item objects ]
}
*/
app.get('/department', (req, res) => {
  
  var dept = req.query.department
  
  inventory
    .find({ department: JSON.parse(dept) })
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .toArray((err, results) => {
      if (err) throw err
      res.status(200).send(results)
    })

  // inventorydb.getDepartmentItems(req.query.department, (err, data) => {
  //   err ? res.sendStatus(500) : res.status(200).send(data)
  // })
})

/***************************************************************************
TODO; auto-suggestions?
TODO: send update to user analytics (TBD - check with Ben on format)

GET request to '/search', when client submits search query in search box
Request object from client:
{
  query: search string
}
Response object:
{
  [ summarized item objects ]
}
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

  // MONGOOSE
  // inventorydb.search(req.query.search, (err, data) => {
    //   err ? res.sendStatus(500) : res.status(200).send(data)
  // })
})

