const elasticSearch = require('elasticsearch');

const client = new elasticSearch.Client({
  hosts: process.env.ELASTICSEARCH_DB || '127.0.0.1:9200',
});

const getSearchResults = (string, callback) =>
  client.search({
    index: process.env.ELASTIC_INDEX || 'backazon',
    type: 'inventory',
    body: {
      query: {
        multi_match: {
          query: string,
          fields: ['name^3', 'description', 'category', 'subcategory', 'department']
        },
      },
    },
  }, (error, response) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, response.hits.hits);
    }
  });

module.exports = {
  getSearchResults,
};
