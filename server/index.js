// const nr = require('newrelic');
const express = require('express');

const app = express();
const inventory = require('../database/mongo');
const cache = require('../database/redis');
const es = require('../database/elasticsearch');
// const analytics = require('./analytics');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`);
});

const bodyParser = require('body-parser');

app.use(bodyParser.json());


// GET request to '/trending', when client visits homepage, or services request trending items
app.get('/inventory/trending', async (req, res) => {
  try {
    const trendingList = await cache.getTrendingItemsList();
    if (trendingList) {
      return res.status(200).send(JSON.parse(trendingList));
    }
    return res.status(500).send('Error retrieving trending items from cache');
  } catch (err) {
    return res.status(500).json(err.stack);
  }
});


// GET request to '/details', when client clicks on product for more info
app.get('/inventory/details', async (req, res) => {
  // const userId = userId || 123;
  const itemId = req.query.item_id;

  // send query to user analytics service
  // analytics.sendQueryToAnalytics(user_id, item_id)

  try {
    let item = await cache.getRecentlyViewedItem(itemId);
    if (!item) {
      inventory.findItem(Number(itemId), (err, result) => {
        if (err) res.status(400).json('Could not find item');

        item = result;
        cache.storeRecentlyViewedItem(itemId, JSON.stringify(item));
        return res.status(200).send(item);
      });
    } else {
      item = JSON.parse(item);
      return res.status(200).send(JSON.parse(item));
    }
  } catch (err) {
    return res.status(500).json(err.stack);
  }
});

// POST request to '/sales', when orders service receives new sales transaction
app.post('/inventory/sales', (req, res) => {

  const soldItems = req.body.items;

  const cb = (err, result) => {
    if (err) console.log(err);
    console.log(result);
  };
  for (let i = 0; i < soldItems.length; i += 1) {
    const itemId = soldItems[i].itemid;
    const qtySold = soldItems[i].qty;

    inventory.updateInventory(itemId, qtySold, cb);
  }
  res.status(200).send('Inventory successfully updated');
});

// GET request to '/department', when client clicks on category/department
app.get('/inventory/department', async (req, res) => {
  const dept = req.query.department;
  try {
    let deptList = await cache.getRecentDepartmentSearch(dept);
    if (!deptList) {
      inventory.getDepartmentList(dept, (err, results) => {
        if (err) throw err;
        deptList = results;
        cache.storeRecentDepartmentSearch(dept, deptList);
        return res.status(200).send(deptList);
      });
    } else {
      return res.status(200).send(JSON.parse(deptList));
    }
  } catch (err) {
    return res.status(500).json(err.stack);
  }
});

// GET request to '/search', when client submits search query in search box
app.get('/inventory/search', async (req, res) => {
  const query = req.query.search;

  try {
    const searchResults = await cache.getRecentSearchResults(query);
    if (!searchResults) {
      es.getSearchResults(query, (err, results) => {
        if (err) {
          console.log('Error searching ES', err)
        } else {
          cache.storeRecentSearchResults(query, results);
          return res.status(200).send(results);
        }
      });
    } else {
      return res.status(200).send(JSON.parse(searchResults));
    }
  } catch (err) {
    return res.status(500).json(err.stack);
  }
});