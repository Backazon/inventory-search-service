const axios = require('axios')

const sendQueryToAnalytics = (user_id, item_id) => {
  
  let query = {
    "UserID"    : 123,
    "ProductID" : item_id,
    "Timestamp" : new Date()
  }

  axios
    .post('/analyticsUrl', {
      query,
    })
    .then(() => console.log('Query successfully send to User Analytics'))
    .catch(console.error)

}

module.exports = {
  sendQueryToAnalytics
}