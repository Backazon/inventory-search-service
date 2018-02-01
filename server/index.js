

/*
TODO: move to cache (will require POST to cache on daily basis)
TODO: send update to user analytics (check with Ben on format)
GET request to '/trending', when client visits Backazon homepage
  Request object from client: 
    { empty }
  Response object:
    {
      [ summarized item objects ]
    }
*/


/*
TODO: send update to user analytics (check with Ben on format)
GET request to '/details', when client clicks on product for more info
  Request object from client:
    {
      itemId: 000000
    }
  Response object: 
    {
      { full item details object }
    }
*/


/*
TODO: move to queue (will require GET from queue request)
POST request to '/newitem', when client submits new item to be hosted on Backazon
  Request object from client: 
    {
      { full product details }
    }
  Response status: 200
*/


/*
TODO: check request object from Chase
POST request to '/sales', when orders service receives new sales transaction
  Request object from orders service: 
    {
      itemId: 000000
      quantity: 00
    }
  Response status: 200
*/


/*
TODO: move to cache, confirm Austin's request object
GET request to '/trending', when filter service requests trending items of day
  Request object from filter service:
    { empty }
  Response object: 
    { 
      [ summarized item objects ]
    }
*/


/*
TODO: move in ElasticSearch or query from cache?
TODO: send update to user analytics (check with Ben on format)
GET request to '/categories', when client clicks on category/department
  Request object from client:
    {
      query: category/brand/department string
    }
  Response object: 
    {
      [ summarized item objects ]
    }
*/


