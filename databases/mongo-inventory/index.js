const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/backazon')

const Schema = mongoose.Schema

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('Mongoose connected successfully'))

const Item = mongoose.model('Item', new Schema({
  item_id: { type: Number, index: true, unique: true },
  name: String,
  description: String,
  price: Number,
  color: String,
  size: String,
  inventory: Number,
  avg_rating: Number,
  review_count: Number,
  image_url: String,
  category: String,
  subcategory: String,
  department: String,
  creation_date: String
}), 'inventory')

//db query functions
const getItemDetails = function(itemId, callback) {
  console.log('itemid:', itemId)
  Item.find({ item_id: itemId }, (err, data) => {
    // err ? callback(err, null) : callback(null, data)
    if (err) { 
      callback(err, null) 
    } else {
      console.log('db data', data)
      callback(null, data)
    }
  })
}

module.exports = {
  //db query function names
  getItemDetails
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
