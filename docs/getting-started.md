# Getting Started

1. Install Camouflage: `npm install -g camouflage-server`
2. Start server: `camouflage -m ./mocks`
3. Start an http and https server: `camouflage -m ./mocks -s -k ./certs/server.key -c ./certs/server.cert`

## Available command line options

```
Required Parameter:
  -m, --mocks   - Path to mock files

Optional Parameters:
  -p, --port             - HTTP Port to listen on
  -x, --secureport       - HTTPS Port to listen on
  -s, --secure           - include https server is required
  -k, --key              - server.key file if -s/--secure is set to true
  -c, --cert             - server.key file if -s/--secure is set to true
```

## Create your first mock

Camouflage follows the same convention as mockserver, to create mocks. For example,

1. You start by creating a directory ${MOCKS_DIR}/hello-world
2. Create a file GET.mock under ${MOCKS_DIR}/hello-world.
3. Paste following content:

```
HTTP/1.1 200 OK
X-Custom-Header: Custom-Value
Content-Type: application/json

{
    "greeting": "Hey! It works"
}
```

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world){target=\_blank}

