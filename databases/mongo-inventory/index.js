const mongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/backazon';


//will be called server-side to get item details
const findItemById = function(itemId) {

  mongoClient.connect(url, function(err, db) {
    console.log('Connected to MongoDB - Backazon');

    var col = db.collection('inventory');
  
    col.find({ item_id: itemId })
  })

}

//will be called server-side once for each department 
const pullTrendingItems = function(department) {

  mongoClient.connect(url, function (err, db) {
    console.log('Connected to MongoDB - Backazon');

    var col = db.collection('inventory');

    col.find({ department: department }).limit(100)
  })

}



module.exports = {
  findItemById,
  pullTrendingItems
}
