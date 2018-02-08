const MongoClient = require('mongodb').MongoClient
var db, inventory

//connect to MongoDB on start
MongoClient.connect('mongodb://localhost:27017/backazon', (err, client) => {
  if (err) {
    console.log('Unable to connect to Mongo')
    process.exit(1)
  } else {
    db = client.db('backazon')
    inventory = db.collection('inventory')
    console.log('Connected to MongoDB...')
  }
})

const findItem = (item_id, callback) => {
  inventory
    .findOne({ item_id: item_id }, (err, doc) => {
      if (err) console.error
      callback(null, doc)
    })
}

const getTrendingItems = (callback) => {
  inventory
    .find({})
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(3000)
    .toArray((err, docs) => {
      if (err) console.error
      callback(null, docs)
    })
}

const insertNewItem = (item, callback) => {
  inventory
    .insertOne(item, (err) => {
      if (err) console.error
      callback(err, null)
    })
}

const updateInventory = (item_id, qty_sold, callback) => {
  inventory
    .updateOne(
      { item_id: parseInt(item_id) }, 
      { $inc: { inventory: -(parseInt(qty_sold)) } }, 
      (err, result) => {
        if (err) console.error
        callback(err, result)
      }
    )
}

const getDepartmentList = (department, callback) => {
  inventory
    .find({ department: JSON.parse(department) })
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .toArray((err, results) => {
      if (err) console.error
      callback(null, results)
    })
}

const search = (query, callback) => {
  inventory
    .find({ $text: { $search: query } })
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .toArray((err, results) => {
      if (err) console.error
      callback(null, results)
    })
}

module.exports = {
  findItem,
  getTrendingItems,
  insertNewItem,
  updateInventory,
  getDepartmentList,
  search
}