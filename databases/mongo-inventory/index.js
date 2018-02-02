const MongoClient = require('mongodb').MongoClient

// const url = 'mongodb://localhost:27017/backazon';


// //will be called server-side to get item details
// const findItemById = function(itemId) {

//   mongoClient.connect(url, function(err, db) {
//     console.log('Connected to MongoDB - Backazon');

//     var col = db.collection('inventory');
  
//     col.find({ item_id: itemId })
//   })

// }

// //will be called server-side once for each department 
// const pullTrendingItems = function(department) {

//   mongoClient.connect(url, function (err, db) {
//     console.log('Connected to MongoDB - Backazon');

//     var col = db.collection('inventory');

//     col.find({ department: department }).limit(100)
//   })

// }


var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done()

  MongoClient.connect(url, function(err, db) {
    if (err) return done(err)
    state.db = db
    done()
  })
}

exports.get = function() {
  var collection = state.db.getCollection('inventory')
  console.log(collection)
  return state.db
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}



// module.exports = {
//   findItemById,
//   pullTrendingItems
// }
