const assert = require('assert')
const server = require('../server/index.js')



describe('inventory server', () => {

  describe('GET /trending', () => {

    it('should return an array of the top 3000 inventory items', () => {
      
    })

  })

  describe('GET /details', () => {

    it('should return an object of the items full details', () => {
      
    })

  })

  describe('POST /newitem', () => {

    it('should add the new item to the inventory database', () => {
      
    })

  })

  describe('POST /sales', () => {

    it('should decrease the inventory quantity of the sold item(s)', () => {
      
    })

  })

  describe('GET /department', () => {

    it('should return an array', () => {
      
    })

    it('should return items only in the specified department', () => {
      
    });
  })

  describe('GET /search', () => {

    it('should return an array of the most relevant items to the search query', () => {
      
    })

  })

})