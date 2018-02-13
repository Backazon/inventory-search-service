const siege = require('siege');

// siege()
//   .on(3000)
//   .for(100000)
//   .times.get('/inventory/details', { item_id: 9000023 })
//   .attack();

// siege()
//   .on(3000)
//   .for(10000)
//   .times.get('/inventory/department', { department: 'Books' })
//   .attack();

siege()
  .on(3000)
  .for(1000).times
  .get('/inventory/trending')
  .attack();

