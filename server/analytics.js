const axios = require('axios')

const sendQueryToAnalytics = (item_id) => {
  
  let query = {
    "UserID"    : 123,
    "ProductID" : item_id,
    "Viewed"    : true,
    "Clicked"   : false,
    "Purchased" : false,
    "Cart"      : false,
    "Wishlist"  : false,
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