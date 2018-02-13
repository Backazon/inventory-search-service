const {
  expect,
  describe,
  it,
  done,
} = require('chai');

const inventory = require('../database/mongo');

const testItemID = 20000001;

describe('Mongo Inventory', () => {
  describe('Finding an item', () => {
    it('should find an item by a unique id', () => {
      inventory.findItem(testItemID, (err, result) => {
        expect(result.name).to.equal('Test Product');
        done();
      });
    });
  });

  describe('Retrieving top trending items', () => {
    it('should get the top 3000 items by rating & review count', () => {
      inventory.getTrendingItems((err, result) => {
        expect(result).to.be.an('array');
        done();
      });
    });
  });

  describe('Inserting a new item to inventory', () => {
    const test = {
      item_id: testItemID,
      name: 'Test Product',
      description: 'Test',
      price: 100,
      color: 'Test',
      size: 'Test',
      inventory: 100,
      avg_rating: 0,
      review_count: 0,
      image_url: 'Test.png',
      category: 'Test',
      subcategory: 'Test',
      department: 'Test',
      creation_date: new Date(),
    };
    it('should insert the new item into the database', () => {
      inventory.insertNewItem(test, (err) => {
        expect(err).to.be(null);
      });
    });
  });

  describe('Updating quantity of item in inventory after sale', () => {
    it('should update the quantity of an item', async () => {
      let prevInventory;
      await inventory.findItem(testItemID, (err, result) => {
        prevInventory = result.inventory;
      });
      inventory.updateInventory(testItemID, 1, (err, result) => {
        expect(result.inventory).to.equal(prevInventory - 1);
        done();
      });
    });
  });

  describe('Searching for top items by specific department', () => {
    it('should return the top 100 items by department', () => {
      inventory.getDepartmentList(JSON.stringify('Books'), (err, result) => {
        expect(result).to.be.an('array');
        done();
      });
    });
  });
});