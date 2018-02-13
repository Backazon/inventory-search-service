const inventory = require('../mongo')
const cache = require('../redis')

const CronJob = require('cron').CronJob;

// update trending items cache at midnight daily
const cronjob = new CronJob({
  cronTime: '0 0 * * *',
  onTick: () => {
     inventory.getTrendingItems(async (err, results) => {
      if (err) throw err
      console.log('Updated cached trending items', new Date())
      await cache.updateTrendingItemsList(results)
    })
  }, 
  start: true,
  timeZone: 'America/Los_Angeles'
})