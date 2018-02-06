const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/backazon')

const Schema = mongoose.Schema

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('Mongoose connected successfully...'))

const Item = mongoose.model('Item', new Schema({
  item_id: { type: Number, index: true, unique: true },
  name: { type:String, es_indexed:true },
  description: { type: String, es_indexed: true },
  price: Number,
  color: String,
  size: String,
  inventory: Number,
  avg_rating: Number,
  review_count: Number,
  image_url: String,
  category: { type: String, es_indexed: true },
  subcategory: { type: String, es_indexed: true },
  department: { type: String, es_indexed: true },
  creation_date: String
}), 'inventory')

//MONGO DB QUERY HANDLERS

//find full inventory item details
const getItemDetails = (itemId, callback) => {
  Item.find({ item_id: itemId }, (err, data) => {
    err ? callback(err, null) : callback(null, data)
  })
}

//find trending items (top 3000)
const getTrendingItems = (callback) => {
  Item
    .find({})
    .sort({ avg_rating: -1, review_count: -1})
    .limit(3000)
    .exec((err, data) => {
      err ? callback(err, null) : callback(null, data)
    })
}
//save new item to inventory
const addItemToInventory = (newItem, callback) => {
  let item = new Item({
    item_id: newItem.item_id,
    name: newItem.name,
    description: newItem.description,
    price: newItem.price,
    color: newItem.color,
    size: newItem.size,
    inventory: newItem.inventory,
    avg_rating: newItem.avg_rating,
    review_count: newItem.review_count,
    image_url: newItem.image_url,
    category: newItem.category,
    subcategory: newItem.subcategory,
    department: newItem.department,
    creation_date: newItem.creation_date
  })
  item.save((err, data) => {
    err ? callback(err, null) : callback(null, data)
  })
}

//update inventory quantity of item(s)
const updateInventory = (itemId, qtySold, callback) => {
  Item.update({ item_id: itemId }, { $inc: { inventory: -qtySold } }, (err, data) => {
    err ? callback(err, null) : callback(null, data)
  })
}
//find top 100 items in specific department
const getDepartmentItems = (department, callback) => {
  Item
    .find({ department: department})
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .exec((err, data) => {
      err ? callback(err, null) : callback(null, data)
    })
}

//search for items by keyword
const search = (query, callback) => {
  console.log('QUERY', query)
  Item
    .find({ $text: { $search: query } })
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .exec((err, data) => {
      err ? callback(err, null) : callback(null, data)
    })
}


module.exports = {
  //db query function names
  getItemDetails,
  getTrendingItems,
  addItemToInventory,
  updateInventory,
  getDepartmentItems,
  search
}



//--------------------------------------------------------------

// const MongoClient = require('mongodb').MongoClient

// // const url = 'mongodb://localhost:27017/backazon';


// // //will be called server-side to get item details
// // const findItemById = function(itemId) {

// //   mongoClient.connect(url, function(err, db) {
// //     console.log('Connected to MongoDB - Backazon');

// //     var col = db.collection('inventory');
  
// //     col.find({ item_id: itemId })
// //   })

// // }

// // //will be called server-side once for each department 
// // const pullTrendingItems = function(department) {

// //   mongoClient.connect(url, function (err, db) {
// //     console.log('Connected to MongoDB - Backazon');

// //     var col = db.collection('inventory');

// //     col.find({ department: department }).limit(100)
// //   })

// // }


// var state = {
//   db: null,
// }

// exports.connect = function(url, done) {
//   if (state.db) return done()

//   MongoClient.connect(url, function(err, db) {
//     if (err) return done(err)
//     state.db = db
//     done()
//   })
// }

// exports.get = function() {
//   var collection = state.db.getCollection('inventory')
//   console.log(collection)
//   return state.db
// }

// exports.close = function(done) {
//   if (state.db) {
//     state.db.close(function(err, result) {
//       state.db = null
//       state.mode = null
//       done(err)
//     })
//   }
// }



// module.exports = {
//   findItemById,
//   pullTrendingItems
// }
