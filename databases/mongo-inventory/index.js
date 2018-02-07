const mongoose = require('mongoose')
const mongoosastic = require('mongoosastic')

mongoose.connect('mongodb://localhost/backazon')

// INSERTING DATA TO MONGO DB
// Run in terminal for each data csv file
// mongoimport --db backazon --collection inventory --type csv --headerline --file /data/inventory0.csv

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('Mongoose connected successfully...'))

const itemSchema = new mongoose.Schema({
  item_id: { type: Number, index: true, unique: true }, //mongo index
  name: { type:String, es_indexed:true }, // elasticsearch index
  description: { type:String, es_indexed:true },
  price: Number,
  color: String,
  size: String,
  inventory: Number,
  avg_rating: Number,
  review_count: Number,
  image_url: String,
  category: { type:String, es_indexed:true },
  subcategory: { type:String, es_indexed:true },
  department: { type:String, es_indexed:true },
  creation_date: String
})

itemSchema.plugin(mongoosastic)

var Item = mongoose.model("Item", itemSchema)

// Item.createMapping((err, mapping) => {
//   if (err) {
//     console.log('error creating mapping (you can safely ignore this)')
//     console.log(err)
//   } else {
//     console.log('mapping created!')
//     console.log(mapping)
//   }
// })


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
// const search = (query, callback) => {
//   Item
//     .find({ $text: { $search: query } })
//     .sort({ avg_rating: -1, review_count: -1 })
//     .limit(100)
//     .exec((err, data) => {
//       err ? callback(err, null) : callback(null, data)
//     })
// }
const search = (query, callback) => {
  Item
    .search({ query: query }, (err, results) => {
      console.log(results)
      err ? callback(err, null) : callback(null, results)
    })
}


module.exports = {
  getItemDetails,
  getTrendingItems,
  addItemToInventory,
  updateInventory,
  getDepartmentItems,
  search
}