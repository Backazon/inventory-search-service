const redis = require('redis')
const client = redis.createClient()

client.on('error', err => {
  console.log('Something went wrong connection to Redis Client ', err)
})

const { promisify } = require('util')

const hset = promisify(client.hset).bind(client)
const hget = promisify(client.hget).bind(client)

//trending
const updateTrendingItemsList = (trendingList) =>
  hset('trending', 'trending', JSON.stringify(trendingList))

const getTrendingItemsList = () => hget('trending', 'trending')

//recently viewed items
const storeRecentlyViewedItem = (itemId, item) =>
  hset('items', itemId, JSON.stringify(item))

const getRecentlyViewedItem = (itemId) => hget('items', itemId)

//recent department searches
const storeRecentDepartmentSearch = (department, departmentList) =>
  hset('departments', department, JSON.stringify(departmentList))

const getRecentDepartmentSearch = (department) => 
  hget('departments', department)

//recent searches
const storeRecentSearchResults = (searchQuery, results) =>
  hset('searches', searchQuery, JSON.stringify(results))

const getRecentSearchResults = (searchQuery) => 
  hget('searches', searchQuery)

//flush database
const flushDatabase = () => client.flushdb()

module.exports = {
  client,
  updateTrendingItemsList,
  getTrendingItemsList,
  storeRecentlyViewedItem,
  getRecentlyViewedItem,
  storeRecentDepartmentSearch,
  getRecentDepartmentSearch,
  storeRecentSearchResults,
  getRecentSearchResults,
  flushDatabase
}