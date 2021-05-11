<p align="center">
    <img src="docs/camouflage.png" alt="camouflage.png" width="300"/>
    <h3 align="center">Camouflage</h3>
    <p align="center">HTTP/gRPC Mocking tool</p>
    <p align="center">
      <img src="https://nodei.co/npm/camouflage-server.png?downloads=true"><br/>
      <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg">
      <img src="https://img.shields.io/github/license/fauxauldrich/camouflage.svg">
      <img src="https://img.shields.io/github/release/fauxauldrich/camouflage.svg">
      <img src="https://img.shields.io/npm/dm/camouflage-server"><br/>
      <img src="https://img.shields.io/github/issues/fauxauldrich/camouflage.svg">
      <img src="https://img.shields.io/github/issues-closed/fauxauldrich/camouflage.svg">
      <img src="https://img.shields.io/github/issues-pr/fauxauldrich/camouflage.svg">
      <img src="https://img.shields.io/github/issues-pr-closed/fauxauldrich/camouflage.svg"><br/>
      <img src="https://img.shields.io/github/repo-size/fauxauldrich/camouflage">
      <img src="https://img.shields.io/bundlephobia/min/camouflage-server">
    </p>
</p>

# What is Camouflage?

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver). As the original description says, the mocking/service virtualization works on a file based structure where you simply organize your mocked HTTP responses in a bunch of mock files and it will serve them like they were coming from a real API; in this way you can write your frontends without caring too much whether your backend is really ready or not.

# Features

- Mocking support for HTTP, HTTPS, HTTP2 and gRPC. (websockets mocking support development ongoing)
- Dynamic/realistic responses without having to write any code.
- Conditional responses based on request parameters.
- Delay Simulation.
- Inbuilt monitoring.
- Inbuilt backup and restore mechanism.
- Quick start with `camouflage init` and `camouflage restore` modules.

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
    mocks_dir: "./mocks"
    port: 8080
  https:
    enable: false
    port: 8443
  http2:
    enable: false
    port: 8081
  grpc:
    enable: false
    host: localhost
    port: 4312
    mocks_dir: "./grpc/mocks"
    protos_dir: "./grpc/protos"
backup:
  enable: true
  cron: "0 * * * *" # Hourly Backup
```

## Create your first mock

Camouflage follows the same convention as mockserver to create mocks. For example,

1. You start by creating a directory ${MOCKS_DIR}/hello-world
2. Create a file GET.mock under ${MOCKS_DIR}/hello-world.
3. Paste following content:

```
HTTP/1.1 200 OK
X-Custom-Header: Custom-Value
Content-Type: application/json

{
    "greeting": "Hey! It works!"
}
```

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world)

### Building from source

If you'd like to get the latest version of Camouflage, you can build it from the source.

    Building from source might have it's own drawbacks, most important of all is that source is always in beta. There might be some bugs which are still being worked upon. You might want to proceed with that aspect in mind.

1. Clone the repository: `git clone https://github.com/fauxauldrich/camouflage.git`
2. Install dependencies: `npm install`
3. Build the project: `npm build`
4. At this point you can run Camouflage using: `node bin/camouflage.js --config ./config.yml`
5. However if you'd like to install Camouflage globally, execute: `npm pack`
6. Install by running command: `npm install -g camouflage-server-${version}.tgz` or `npm install -g camouflage-server-${version}.zip`

Full Documentation: [https://fauxauldrich.github.io/camouflage/](https://fauxauldrich.github.io/camouflage/)
