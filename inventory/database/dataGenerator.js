const faker = require('faker');
const fs = require('fs');
const _progress = require('cli-progress');
const util = require('util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


// create a new progress bar instance and use shades_classic theme
// const progressbar = new _progress.Bar(
//   { format: '[{bar}] {percentage}% | {value}/{total} | Duration: {duration}' },
//   _progress.Presets.shades_classic,
// );
// progressbar.start(500000, 0);


// const writeFile = util.promisify(fs.writeFile);

const sizes = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
const departments = ["Clothing, Shoes & Jewelry", "Home & Kitchen", "Digital Music", "Books", "Cell Phones & Accessories", "Automotive Parts & Accessories", "Sports & Outdoors", "Tools & Home Improvement", "Collectibles & Fine Art", "Industrial & Scientific", "Electronics", "Baby", "Health, Household & Baby Care", "Office Products", "Toys & Games", "Kindle Store", "Arts, Crafts & Sewing", "CDs & Vinyl", "Garden & Outdoor", "Everything Else", "Beauty & Personal Care", "Pet Supplies", "Grocery & Gourmet Food", "Movies & TV", "Appliances", "Handmade", "Musical Instruments", "Apps & Games", "Video Games", "Software", "Alexa Skills", "Magazine Subscriptions", "Gift Cards", "Courses", "Kindle Accessories", "Home & Business Services"];

// // item creator
// async function doStuff(n) {
//   let count = n;
//   let itemCount = 10000000;

//   // for (let j = 0; j < 20; j++) {
//     const inventory = [];
//     count += 1;

//     for (let i = 0; i < 500000; i += 1) {
//       // adjust number to 10 million later
//       const item = {
//         item_id: i + itemCount,
//         name: faker.commerce.productName(),
//         description: faker.commerce.productAdjective(),
//         price: faker.commerce.price(),
//         color: faker.commerce.color(),
//         size: sizes[Math.floor(Math.random() * sizes.length)],
//         inventory: Math.floor(Math.random() * 10001),
//         avg_rating: Math.floor(Math.random() * 6),
//         review_count: Math.floor(Math.random() * 5001),
//         image_url: faker.image.imageUrl(),
//         category: faker.commerce.department(),
//         subcategory: faker.commerce.productMaterial(),
//         department: departments[Math.floor(Math.random() * departments.length)],
//         creation_date: faker.date.past()
//       };
//       inventory.push(item);
//       progressbar.update(i);
//     }
//     itemCount += 500000;

//     const stringifiedItems = JSON.stringify(inventory);
//     const file = `inventory${count}.json`;
//     await writeFile(file, stringifiedItems);
//   // }
// }
// try {
//   doStuff(1).then(() => {
//     console.log('done');
//   });
// } catch (err) {
//   console.error(err);
// }
// // stop the progress bar
// progressbar.stop();



// CSV FILE CREATION

async function createData() {

  for (var j = 15; j < 20; j++) {
    let fileCt = j;
    let itemCt = (j + 1) * 500000;

    let csvWriter = createCsvWriter({
      path: __dirname + `/data/inventory${fileCt}.csv`,
      header: [{ id: 'item_id', title: 'item_id' }, { id: 'name', title: 'name' }, { id: 'description', title: 'description' }, { id: 'price', title: 'price' }, { id: 'color', title: 'color' }, { id: 'size', title: 'size' }, { id: 'inventory', title: 'inventory' }, { id: 'avg_rating', title: 'avg_rating' }, { id: 'review_count', title: 'review_count' }, { id: 'image_url', title: 'image_url' }, { id: 'category', title: 'category' }, { id: 'subcategory', title: 'subcategory' }, { id: 'department', title: 'department' }, { id: 'creation_date', title: 'creation_date' }]
    });

    let records = [];

    for (let i = 1; i <= 500000; i++) {
      let item = {
        item_id: itemCt,
        name: faker.commerce.productName(),
        description: faker.commerce.productAdjective(),
        price: faker.commerce.price(),
        color: faker.commerce.color(),
        size: sizes[Math.floor(Math.random() * sizes.length)],
        inventory: Math.floor(Math.random() * 10001),
        avg_rating: Math.floor(Math.random() * 6),
        review_count: Math.floor(Math.random() * 5001),
        image_url: faker.image.imageUrl(),
        category: faker.commerce.department(),
        subcategory: faker.commerce.productMaterial(),
        department: departments[Math.floor(Math.random() * departments.length)],
        creation_date: faker.date.past()
      };
      records[i] = item;
      itemCt++;
    }

    csvWriter
      .writeRecords(records) // returns a promise
    // .then(() => {
    //   console.log('...Done');
    // });
  }
}

try {
  createData().then(() => {
    console.log('Done');
  });
} catch (err) {
  console.error(err);
}