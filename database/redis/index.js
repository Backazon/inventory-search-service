const redis = require('redis')
const client = redis.createClient()

client.on('error', err => {
  console.log('Something went wrong connection to Redis Client ', err)
})

const { promisify } = require('util')

const setAsync = promisify(client.set).bind(client)
const getAsync = promisify(client.get).bind(client)


const updateTrendingItemsList = (trendingList) => {
  return setAsync('trending', JSON.stringify(trendingList))
}

const getTrendingItemsList = () => {
  return getAsync('trending')
}

const storeRecentlyViewedItem = (itemId, item) => {
  return setAsync(itemId, JSON.stringify(item))
}

const getRecentlyViewedItem = (itemId) => {
  return getAsync(itemId) 
}

const storeRecentDepartmentSearch = (department, departmentList) => {
  return setAsync(department, JSON.stringify(departmentList))
}

const getRecentDepartmentSearch = (department) => {
  return getAsync(department)
}

const storeRecentSearchResults = (searchQuery, results) => {
  return setAsync(searchQuery, JSON.stringify(results))
}

const getRecentSearchResults = (searchQuery) => {
  return getAsync(searchQuery)
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