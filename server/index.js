
const express = require('express')
const app = express()

//INVENTORY DATABASE
// const inventoryDb = require('../databases/mongo-inventory/index.js')
const MongoClient = require('mongodb').MongoClient
var inventory

//connect to MongoDB on start
MongoClient.connect('mongodb://localhost:27017/backazon', (err, client) => {
  if (err) {
    console.log('Unable to connect to Mongo')
    process.exit(1)
  } else {
    inventory = client.db('backazon').collection('inventory')

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
app.get('/trending', (req, res) => {
  //get list of all departments
  //iterate over departments and query for top 100 items in each dept

  var trendingItems = []
  
  inventory.find({ item_id: 1504401 }).limit(100).toArray(function (err, result) {
    if (err) throw err

    console.log(result)
  })


  res.sendStatus(200)
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
app.get('/details', function(req, res) {
  //get item id from req object

  var collection = inventoryDb.get().collection('inventory')
  // collection.find({ item_id: })
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


