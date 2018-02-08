const redis = require('redis')
const client = redis.createClient()
client.on('error', err => {
  console.log('Something went wrong connection to Redis Client ', err)
})

const { promisify } = require('util')
const setAsync = promisify(client.set).bind(client)
const getAsync = promisify(client.get).bind(client)

const updateTrendingItemsList = (trendingList) => {
  setAsync('trending', JSON.stringify(trendingList))
}

const getTrendingItemsList = () => {
  getAsync('trending')
}

const storeRecentlyViewedItem = (itemId, item) => {
  setAsync(itemId, JSON.stringify(item))
}

const getRecentlyViewedItem = (itemId) => {
  getAsync(itemId) 
}

const storeRecentDepartmentSearch = (deparment, departmentList) => {
  setAsync(department, JSON.stringify(departmentList))
}

const getRecentDepartmentSearch = (department) => {
  getAsync(department)
}

const storeRecentSearchResults = (searchQuery, results) => {
  setAsync(searchQuery, JSON.stringify(results))
}

const getRecentSearchResults = (searchQuery) => {
  getAsync(searchQuery)
}

module.exports = {
  client,
  updateTrendingItemsList,
  getTrendingItemsList,
  storeRecentlyViewedItem,
  getRecentlyViewedItem,
  storeRecentDepartmentSearch,
  getRecentDepartmentSearch,
  storeRecentSearchResults,
  getRecentSearchResults
}