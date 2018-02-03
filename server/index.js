
const express = require('express')
const app = express()
const assert = require('assert')
const bodyParser = require('body-parser');

app.use(bodyParser.json());

//INVENTORY DATABASE
// const inventoryDb = require('../databases/mongo-inventory/index.js')
const MongoClient = require('mongodb').MongoClient
var db, inventory
// const departments = require('../databases/mongo-inventory/dataGenerator.js')

//connect to MongoDB on start
MongoClient.connect('mongodb://localhost:27017/backazon', (err, client) => {
  if (err) {
    console.log('Unable to connect to Mongo')
    process.exit(1)
  } else {
    db = client.db('backazon')
    inventory = db.collection('inventory')

    app.listen(3000, function() {
      console.log('Listening on port 3000...')
    })
  }
})

/*
TODO: move to CACHE for Ben & Austin (will require POST to cache on daily basis)

GET request to '/trending', when client visits Backazon homepage
  Request object from client: 
    { empty }
  Response object:
    {
      [ summarized item objects ]
    }
*/
app.get('/trending', async (req, res) => {
  //get list of all departments
  //iterate over departments and query for top 100 items in each dept
  var trendingItems = []
  
  function getTrendingItems() {
    for (var i = 0; i < departments.length; i++) {
      inventory.find({ department: departments[i] }).sort({ avg_rating: 1 }).limit(100).toArray(function (err, result) {
        if (err) { 
          throw err
        } else {
          console.log(result);
          trendingItems.push(result);
        }
      })
    }
  }
  try {
    await getTrendingItems().then(() => {
      console.log(trendingItems)
      res.send(trendingItems);
    })
  } catch (err) {
    console.log(err)
  }

  //send back trending items
  // res.status(201).send(trendingItems)
  // res.sendStatus(200)
})

/*
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
*/
app.get('/details', (req, res) => {

  var itemId = parseInt(req.query.item_id)
  
  inventory.findOne({item_id: itemId}, (err, doc) => {
    if (err) res.status(400).json('Could not find item')

    assert.equal(null, err)
    assert.ok(doc != null)

    res.status(201).send(doc)
  })

})

/*
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
    inventory: 1,
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

    res.status(201).send('New item successfully added')
  })
})

/*
TODO: confirm data object with Chase

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


/*
TODO: move to cache, confirm Austin & Ben's request to '/trending'

GET request to '/trending', when filter service requests trending items of day
  Request object from filter service:
    { empty }
  Response object: 
    { 
      [ summarized item objects ]
    }
*/


/*
TODO: move in ElasticSearch or query from cache?

GET request to '/categories', when client clicks on category/department
Request object from client:
{
  query: category/brand/department string
}
Response object: 
{
  [ summarized item objects ]
}

TODO: send update to user analytics

*/


// SEARCH DATABASE

/*
TODO; auto-suggestions?

GET request to '/queries', when client submits search query in search box
Request object from client:
{
  query: keyword string(s)
}
Response object:
{
  [ summarized item objects ]
}

TODO: send update to user analytics (TBD - check with Ben on format)
*/


/*
GET request to '/categories' ?? See above line 67

*/


