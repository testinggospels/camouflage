# Request model

Request object made available by Camouflage is simply an instance of express request object for a given incoming request. Following are the properties/objects available on the request object which can be used in request matching or to extract information out of the request.

- request.baseUrl
- request.body
- request.cookies
- request.method
- request.originalUrl
- request.path
- request.protocol
- request.query
- request.body

Refer to [Express Documentation](http://expressjs.com/en/4x/api.html#req) for more information on each of these properties.
