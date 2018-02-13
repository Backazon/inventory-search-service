const elasticSearch = require('elasticsearch')

const client = new elasticSearch.Client({
  hosts: process.env.ELASTICSEARCH_DB || '127.0.0.1:9200',
})

const getSearchResults = (string, callback) =>
  client.search({
    index: process.env.ELASTIC_INDEX || 'backazon',
    type: 'inventory',
    body: {
      "query": {
        "multi_match": {
          "query": string,
          "fields": ["name^3", "description", "category", "subcategory", "department"]
        }
      }
    }
  }, function (error, response, status) {
    if (error) {
      callback(error, null)
    } else {
      console.log("---- Response ----")
      console.log(response)
      // console.log("---- Hits ----")
      // response.hits.hits.forEach(function(hit) {
      //   console.log(hit)
      // })
      callback(null, response.hits.hits);
    }
  })

module.exports = {
  getSearchResults
}