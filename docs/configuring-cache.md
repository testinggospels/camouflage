# Configuring Cache

## In Memory Cache
Camouflage uses [apicache](https://www.npmjs.com/package/apicache){target=\_blank} for caching. By default, apicache uses memory for caching, however it also provides a number of configurable options. To specify any of these optional configurations, modify `config.yml` in following way.

```yaml
cache:
  enable: false
  ttl_seconds: 300
  cache_options: # Optional
    debug: false
    defaultDuration: "1 hour"
    enabled: true
    headerBlacklist: []
    statusCodes:
      exclude: []
      include: []
    trackPerformance: false
    headers: {}
    respectCacheControl: false
```

`camouflage init`, generates two options for cache configuration i.e. `enable` and `ttl_seconds`. These are parameters, Camouflage uses to configure a basic in memory cache. These options are not related or provided by `apicache`.

However, you can additionally specify one or more options as shown above under `cache_options`, to control the behavior of Camouflage's cache mechanism.

List of options made available by `apicache` are as follows:

```javascript
{
  debug:            false|true,     // if true, enables console output
  defaultDuration:  '1 hour',       // should be either a number (in ms) or a string, defaults to 1 hour
  enabled:          true|false,     // if false, turns off caching globally (useful on dev)
  headerBlacklist:  [],             // list of headers that should never be cached
  statusCodes: {
    exclude:        [],             // list status codes to specifically exclude (e.g. [404, 403] cache all responses unless they had a 404 or 403 status)
    include:        [],             // list status codes to require (e.g. [200] caches ONLY responses with a success/200 code)
  },
  trackPerformance: false,          // enable/disable performance tracking... WARNING: super cool feature, but may cause memory overhead issues
  headers: {
    // 'cache-control':  'no-cache' // example of header overwrite
  },
  respectCacheControl: false|true   // If true, 'Cache-Control: no-cache' in the request header will bypass the cache.
}
```

## Redis Cache

Cache can be implemented using redis, by providing an additional `redis_options` under `cache_options`


```yaml
cache:
  enable: false
  ttl_seconds: 300
  cache_options: # Optional
    debug: false
    defaultDuration: "1 hour"
    enabled: true
    headerBlacklist: []
    statusCodes:
      exclude: []
      include: []
    trackPerformance: false
    headers: {}
    respectCacheControl: false
    redis_options: # Optional
      host: 127.0.0.1
      port: 6379
```

For a complete list of available redis options, refer to [redis documentation](https://www.npmjs.com/package/redis){target=\_blank}

!!!note

    Some of the options are not directly trasferred from the underlying packages. For example, `apicache` provides two more options, other than the ones mentioned above, i.e. `redisClient` and `appendKey`. Camouflage does not support `appendKey`, whereas `redisClient` is automatically configured when you provide `redis_options` as shown above.

    Similarily, `redis` package provides a `retry_strategy` option, which is not supported by Camouflage.

    This might change in future releases.