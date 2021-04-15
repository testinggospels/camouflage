# Getting Started

1.  Install Camouflage: `npm install -g camouflage-server`
2.  Run `camouflage --version` to validate the installation was successful.
3.  Startup Options:

    - If you only want an HTTP server, start Camouflage using: `camouflage -m ./mocks`
    - If you need an http and https server both: `camouflage -m ./mocks -s -k ./certs/server.key -c ./certs/server.cert`
    - If you plan to run a performance test, we advice starting Camouflage in performance mode by providing number of CPUs parameter: `camouflage -m ./mocks -n 4` (Learn more on **Performance Mode** page)

## Available command line options

| Notation     | Shorthand | Description                                   | Type                                       |
| :----------- | :-------: | :-------------------------------------------- | :----------------------------------------- |
| --mocks      |    -m     | Path to directory containing mock files       | Required                                   |
| --port       |    -p     | HTTP Port to listen on                        | Optional                                   |
| --secure     |    -s     | Start with an additional HTTPS Server         | Optional                                   |
| --secureport |    -x     | HTTPS Port to listen on                       | Optional                                   |
| --key        |    -k     | server.key file                               | Required, if Camouflage is started with -s |
| --cert       |    -c     | server.cert file                              | Required, if Camouflage is started with -s |
| --cpus       |    -n     | Number of CPUs you want Camouflage to utilize | Optional                                   |

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

### Building from source

If you'd like to get the latest version of Camouflage, you can build it from the source.

!!! note

    Building from source might have it's own drawbacks, most important of all is that source is always in beta. There might be some bugs which are still being worked upon. You might want to proceed with that aspect in mind.

1. Clone the repository: `git clone https://github.com/fauxauldrich/camouflage.git`
2. Install dependencies: `npm install`
3. Build the project: `npm build`
4. At this point you can run Camouflage using: `node bin/camouflage.js -m ./mocks`
5. However if you'd like to install Camouflage globally, execute: `npm pack`
6. Install by running command: `npm install -g camouflage-server-${version}.tgz` or `npm install -g camouflage-server-${version}.zip`

