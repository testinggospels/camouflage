# Getting Started

1.  Camouflage is an NPM package, therefore to install Camouflage, you'd need to install NodeJS (>v14) first, if you haven't already done so.
2.  Install Camouflage: `npm install -g camouflage-server`
3.  Run `camouflage --version` to validate the installation was successful.
4.  Create an empty directory anywhere in your machine and navigate to it in your terminal.
5.  Execute command `camouflage init`. This creates a basic skeleton of the folders you'd need in order to get started. You can modify these folders as per your requirements.
6.  Start the Camouflage server by initializing it with a config.yml file: `camouflage --config config.yml`

## Configuration Options / Sample Config yml File

```yaml
loglevel: info
cpus: 1
monitoring:
  port: 5555
ssl:
  cert: "./certs/server.cert"
  key: "./certs/server.key"
protocols:
  http:
    enable: true
    mocks_dir: "./mocks"
    port: 8080
  https:
    enable: false
    port: 8443
  http2:
    enable: false
    port: 8081
  ws:
    enable: false
    mocks_dir: "./ws_mocks"
    port: 8082
  grpc:
    enable: false
    host: localhost
    port: 4312
    mocks_dir: "./grpc/mocks"
    protos_dir: "./grpc/protos"
backup:
  enable: true
  cron: "0 * * * *" # Hourly Backup
cache:
  enable: false
  ttl_seconds: 300
injection:
  enable: true
ext_helpers: "./custom_handlebar.json" # Remove if not needed
origins:
  - http://localhost:3000/
  - http://localhost:3001/
  - http://localhost:5000/
```

## Create your first mock

Camouflage follows the same convention as mockserver to create mocks. For example,

1. You start by creating a directory `${MOCKS_DIR}/hello-world`
2. Create a file GET.mock under `${MOCKS_DIR}/hello-world`
3. Paste following content:

```
HTTP/1.1 200 OK
X-Custom-Header: Custom-Value
Content-Type: application/json

{
    "greeting": "Hey! It works!"
}
```

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world){target=\_blank}

### Building from source

Camouflage is still in its early development and has a long way to go before it reaches v1.0.0. Which means there might be some bugs, missed use cases, incorrect implementations of some functionalities. This is to be expected. But, the good news is that we are constantly evolving.

There might be times when latest changes have not gone to release yet, such changes exist in the `develop` branch, which is the most updated version of Camouflage. If you'd like to get your hands on the upcoming release of Camouflage at any point, you can build it from the source. However, since this source might contain changes that are not tested yet and are not ready for use, you might want to proceed with caution.

1. Clone the repository: `git clone https://github.com/testinggospels/camouflage.git`
2. Checkout `develop` branch: `git checkout develop`
3. Install dependencies: `npm install`
4. Build the project: `npm build`
5. At this point you can run Camouflage using: `node bin/camouflage.js --config ./config.yml`
6. However if you'd like to install Camouflage globally, execute: `npm pack`
7. Install by running command: `npm install -g camouflage-server-0.0.0-development.tgz` or `npm install -g camouflage-server-0.0.0-development.zip`
