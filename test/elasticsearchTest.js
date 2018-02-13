const { expect } = require('chai')

const es = require('../database/elasticsearch')

describe('ElasticSearch', () => {
  describe('search by keyword(s)', () => {
    it('should return a list of related items to a query string', () => {
      es.getSearchResults('test', (err, results) => {
        expect(results).to.be.an('array')
      })
    })
  })
})