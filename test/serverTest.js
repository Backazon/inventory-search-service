const { expect } = require('chai')
const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../server')
const inventory = require('../database/mongo')

chai.use(chaiHttp)

describe('Server Routes', () => {

  describe('GET /inventory/trending', () => {
    it('should return a status of 200', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/trending')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          done()
        })
    }).timeout(1000)
    it('should respond with JSON to a GET request', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/trending')
        .end((err, res) => {
          expect(res).to.be.json
          done()
        })
    }).timeout(1000)
    it('should return a list of the top 3000 inventory items', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/trending')
        .end((err, res) => {
          expect(res.body).to.be.an('array')
          expect(res.body.length).to.equal(3000)
          done()
        })
    }).timeout(1000)
    it('should return a list of objects with full details for each item', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/trending')
        .end((err, res) => {
          expect(res.body[0]).to.be.an('object')
          done()
        })
    }).timeout(1000)
  })

  describe('GET /inventory/details', () => {
    it('should return a status of 200', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/details')
        .query({ item_id: 20000001 })
        .end((err, res) => {
          expect(res.status).to.equal(200)
          done()
        })
    }).timeout(1000)
    it('should return an object', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/details')
        .query({ item_id: 51 })
        .end((err, res) => {
          expect(res).to.be.an('object')
          done()
        })
    }).timeout(1000)
    it('should return item details given a valid id', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/details')
        .query({ item_id: 20000001 })
        .end((err, res) => {
          expect(res.body.item_id).to.equal(20000001)
          done()
        })
    }).timeout(1000)
    it('should return a status of 500 if the item does not exist', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/details')
        .query({ item_id: 1 })
        .end((err, res) => {
          expect(res.status).to.equal(500)
          done()
        })
    }).timeout(1000)
  })

  describe('POST /inventory/sales', () => {
    it('should return a status of 200', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/sales')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          done()
        })
    }).timeout(1000)
  })

  describe('GET /inventory/department', () => {
    it('should return a status of 200', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/department')
        .end((err, res) => {
          expect(res.status).to.equal(200)
          done()
        })
    }).timeout(1000)
    it('should return a list of the top 100 department items', () => {
      chai 
        .request('localhost:3000')
        .get('/inventory/department')
        .query({ department: "Books" })
        .end((err, res) => {
          expect(res.body).to.be.an('array')
          done()
        })
    }).timeout(1000)
    it('should return items only in the specified department', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/department')
        .query({ department: "Home & Kitchen"})
        .end((err, res) => {
          expect(res.body[Math.floor(Math.random() * 100)].department).to.equal("Home & Kitchen")
          done()
        })
    }).timeout(1000)
  })

  describe('GET /inventory/search', () => {
    it('should return an array of items', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/search')
        .query({ search: "table" })
        .end((err, res) => {
          expect(res.body).to.be.an('array')
          done()
        })
    }).timeout(1000)
    it('should return a status of 500 if the no items match the query', () => {
      chai
        .request('localhost:3000')
        .get('/inventory/search')
        .query({ item_id: "123" })
        .end((err, res) => {
          expect(res.status).to.equal(500)
          done()
        })
    }).timeout(1000)
  })

})
after(() => process.exit(0))