const sqs_getNewItems = require('../../sqs-queue/sqs_getNewItems')

const CrobJob = require('cron').CronJob

//check for new items in queue every hour
const cronjob = new CronJob({
  cronTime: '0 0-23 * * *',
  onTick: () => {
    sqs_getNewItems.getMessage()
  },
  start: true,
  timeZone: 'America/Los_Angeles'
})