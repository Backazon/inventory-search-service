const axios = require('axios')

const sendQueryToAnalytics = (user_id, item_id) => {

  axios
    .post('/analyticsUrl', {
      UserID: user_id,
      ProductID: item_id,
      Timestamp: new Date()
    })
    .then(() => console.log('Query successfully sent to User Analytics'))
    .catch(console.error)

}

module.exports = {
  sendQueryToAnalytics
}