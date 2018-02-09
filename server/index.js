const nr = require('newrelic')
const express = require('express')
const app = express()
const assert = require('assert')
const bodyParser = require('body-parser')

const PORT = 3000

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`)
})
app.use(bodyParser.json())


const CronJob = require('cron').CronJob;

// QUEUE
const newItemQueue = require('./newItemQueue.js')
// REDIS DATABASE
const redis = require('../database/redis')
// INVENTORY DATABASE
const mongoInventory = require('../database/mongo')

//USER ANALYTICS
const analytics = require('./analytics.js')


// REQUEST HANDLERS
/***************************************************************************
Update trending items in Redis cache on daily basis
*/
const cronjob = new CronJob({
  cronTime: '00 00 00 * * *',
  onTick: () => {
    console.log('Executing Cron Job', new Date())

    mongoInventory.getTrendingItems(async (err, results) => {
      if (err) throw err
      console.log('Cron job successful', new Date())
      await redis.flushDatabase()
      await redis.updateTrendingItemsList(results)
    })
  }, 
  start: true,
  timeZone: 'America/Los_Angeles'
})

/***************************************************************************
 GET request to '/trending', when client visits Backazon homepage,
 or when filter/analytics request trending items
 Response object: { [ summarized item objects ] }
*/
app.get('/trending', async (req, res) => {
  try {
    let trendingList = await redis.getTrendingItemsList()
    if (trendingList) {
      return res.status(200).send(JSON.parse(trendingList))
    } else {
      return res.status(500).send('Error updating trending items in cache')
    }
  } catch (err) {
    return res.status(500).json(err.stack)
  }
})

/***************************************************************************
GET request to '/details', when client clicks on product for more info
Request object:   { item_id: number }
Response object:  { full item details object }
*/
app.get('/details', async (req, res) => {
  var item_id = req.query.item_id
  
  //send query to user analytics service
  analytics.sendQueryToAnalytics(item_id)

  try {
    let item = await redis.getRecentlyViewedItem(item_id)
    if (!item) {
      mongoInventory.findItem(parseInt(item_id), (err, result) => {
        if (err) res.status(400).json('Could not find item')

        item = result
        redis.storeRecentlyViewedItem(item_id, JSON.stringify(item))
        return res.status(200).send(item)
      })
    } else {
      item = JSON.parse(item)
      return res.status(200).send(JSON.parse(item))
    }
  } catch (err) {
    return res.status(500).json(err.stack)
  }
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

  while(newItemQueue.size() > 0) {
    let nextItem = newItemQueue.dequeue();

    mongoInventory.insertNewItem(nextItem, (err, result) => {
      res.status(200).send(nextItem)
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
TODO: turn into GET request to sales queue

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

    mongoInventory.updateInventory(itemId, qtySold, (err, result) => {
      assert.equal(null, err)
      assert.equal(1, result.result.nModified)
    })
  }
  res.status(200).send('Inventory successfully updated')
})

/***************************************************************************
GET request to '/department', when client clicks on category/department
Request from client:  { query: string }
Response object:      { [ summarized item objects ] }
*/
app.get('/department', async (req, res) => {
  var dept = req.query.department
  console.log(dept)
  
  try {
    let deptList = await redis.getRecentDepartmentSearch(dept)
    if (!deptList) {
      mongoInventory.getDepartmentList(dept, (err, results) => {
        if (err) throw err
        deptList = results
        redis.storeRecentDepartmentSearch(dept, deptList)
        return res.status(200).send(deptList)
      })
    } else {
      return res.status(200).send(JSON.parse(deptList))
    }  
  } catch (err) {
    return res.status(500).json(err.stack)
  }
})

/***************************************************************************
TODO; elastic search auto-suggestions?

GET request to '/search', when client submits search query in search box
Request from client:  { query: string }
Response object:      { [ summarized item objects ] }
*/
app.get('/search', async (req, res) => {
  var query = req.query.search

  try {
    let searchResults = await redis.getRecentSearchResults(query)
    if (!searchResults) {
      mongoInventory.search(query, (err, results) => {
        if (err) throw err

        searchResults = results
        redis.storeRecentSearchResults(query, searchResults)
        return res.status(200).send(searchResults)
      })
    } else {
      return res.status(200).send(JSON.parse(searchResults))
    }
  } catch (err) {
    return res.status(500).json(err.stack)
  }
})

