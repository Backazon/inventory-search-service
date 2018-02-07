const { expect } = require('chai')
const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../server')

chai.use(chaiHttp)

describe('BACKAZON INVENTORY SERVER', () => {

  describe('GET /trending', () => {

    it('should return an array of the top 3000 inventory items', (done) => {
      chai
        .request(server)
        .get('/trending')
        .end((err, res) => {
          console.log(res)
          // expect(res).to.have.status(200)
          done()
        })
    })//.timeout(1000)

  })

  describe('GET /details', () => {

    it('should return an object of the items full details', () => {
      chai
        .request(server)
        .get('/details')
        .query({ item_id: 51 })
        .end((err, res) => {
          expect(res).to.have.status(200)
          done()
        })
    }).timeout(1000)

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
after(() => process.exit(0))