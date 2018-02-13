const mongo = require('mongodb');

const Client = mongo.MongoClient;

let db;
let inventory;

// connect to MongoDB on start
Client.connect('mongodb://localhost:27017/backazon', (err, client) => {
  if (err) {
    console.log('Unable to connect to Mongo');
    process.exit(1);
  } else {
    db = client.db('backazon');
    inventory = db.collection('inventory');
    console.log('Connected to MongoDB...');
  }
});

const findItem = (itemId, callback) => {
  inventory
    .findOne({ item_id: itemId }, (err, doc) => {
      if (err) console.log(err);
      callback(null, doc);
    });
};

const getTrendingItems = (callback) => {
  inventory
    .find({})
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(3000)
    .toArray((err, docs) => {
      if (err) console.log(err);
      callback(null, docs);
    });
};

const insertNewItem = (item, callback) => {
  inventory
    .insertOne(item, (err) => {
      if (err) console.log(err);
      callback(err, null);
    });
};

const updateInventory = (itemId, qtySold, callback) => {
  inventory
    .updateOne(
      { item_id: Number(itemId) },
      { $inc: { inventory: -(Number(qtySold)) } },
      (err, result) => {
        if (err) console.log(err);
        callback(err, result);
      },
    );
};

const getDepartmentList = (department, callback) => {
  inventory
    .find({ department: JSON.parse(department) })
    .sort({ avg_rating: -1, review_count: -1 })
    .limit(100)
    .toArray((err, results) => {
      if (err) console.log(err);
      callback(null, results);
    });
};

module.exports = {
  findItem,
  getTrendingItems,
  insertNewItem,
  updateInventory,
  getDepartmentList,
};
