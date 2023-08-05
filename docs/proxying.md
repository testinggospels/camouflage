# Proxying

Camouflage allows you to proxy selective calls to an external system using `{{#proxy}}{{/proxy}}` handlebar helper. Proxy support uses `http-proxy` as it's underlying library and most options are supported as is. To create a proxy endpoint, begin by creating folders and mock file for your desired downstream.

Example: If you would like Camouflage to proxy a POST request to a downstream endpoint i.e. `/calls-proxied/to/this-target`, you would create a file in following manner.

```
${HTTP_MOCKS_DIR}/calls-proxied/to/this-target/POST.mock
```

Content of this mock file will use proxy block helper and specify a configuration as supported by `http-proxy`:

```javascript
HTTP/1.1 200 OK

{{#proxy}}
{
    "target": "http://localhost:9008",
    "ssl": {
        "key": "valid-ssl-key.pem"
        "cert": "valid-ssl-cert.pem"
    },
    "secure": true
}
{{/proxy}}
```

For more details on the available options, refer to [http-proxy's documentation](https://www.npmjs.com/package/http-proxy){target=\_blank}

!!! note

    For options requiring fs.readFileSync("path"), you can simply specify the path as string as shown in ssl.key and ssl.cert example above. Camouflage takes care of reading the file from the specified path.