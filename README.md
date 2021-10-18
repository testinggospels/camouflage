<p align="center">
    <img src="https://testinggospels.github.io/camouflage/camouflage.png" alt="camouflage.png" width="300"/>
    <h3 align="center">Camouflage</h3>
    <p align="center">HTTP/gRPC Mocking tool</p>
    <p align="center">
      <img src="https://nodei.co/npm/camouflage-server.png?downloads=true"><br/>
      <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg">
      <img src="https://img.shields.io/github/license/testinggospels/camouflage.svg">
      <img src="https://img.shields.io/github/release/testinggospels/camouflage.svg">
      <img src="https://img.shields.io/npm/dm/camouflage-server"><br/>
      <img src="https://github.com/testinggospels/camouflage/actions/workflows/release.yaml/badge.svg">
      <img src="https://img.shields.io/github/repo-size/testinggospels/camouflage">
      <img src="https://img.shields.io/bundlephobia/min/camouflage-server"><br/><br/>
      <h3 align="center"><a href="https://testinggospels.github.io/camouflage/">Complete Documentation</a></h3>
      <h3 align="center"><a href="http://camouflage-server.herokuapp.com/">Demo</a></h3>
    </p>
</p>

# Support
[![Chat on Discord](https://img.shields.io/badge/chat-Discord-7289DA?logo=discord)](https://discord.gg/hTqXuG7dsV)

# What is Camouflage?

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver). Camouflage works on a file based endpoint configuration system, which means it allows you to create a mock endpoint by simply creating a set of directories and a mock file, using which necessary responses are generated when you call the endpoint.

# Available Features

🔥 File based mocking support for HTTP, HTTPS, HTTP2, gRPC and websockets. 🔥

⚡ Dynamic/realistic responses without having to write any code. ⚡

🧩 Flexibility to partially or fully code your responses. 🧩

🎯 Conditional responses based on request parameters. 🎯

🌟 Inbuilt Caching - In memory and redis. 🌟

🧮 Ability to fetch and condition the response using external data. Currently supported data sources are CSV and postgres. 🧮

⏳ Delay Simulation. ⏳

🔍 Inbuilt monitoring. 🔍

🦺 Inbuilt backup and restore mechanism. 🦺

⏩ Quick start with `camouflage init` and `camouflage restore` modules. ⏩

🎊 Deployable on standalone VMs, Dockers and Kubernetes. 🎊

📁 Comes with a file explorer UI that allows modification of mock files hosted remotely. 📁

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
  enable: false
  cron: "0 * * * *" # Hourly Backup
cache:
  enable: false
  ttl_seconds: 300
injection:
  enable: false
ext_helpers: "./custom_handlebar.json" # Remove if not needed
origins:
  - http://localhost:3000/
  - http://localhost:3001/
  - http://localhost:5000/
```

## Create your first mock

Camouflage uses a file based system to configure the endpoints. For example, to create a mock to the endpoint /`hello-world`:

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

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world)

`${MOCK_DIR}` is defined in `config.yaml` as `protocols.http.mocks_dir`. Refer to [docs](https://testinggospels.github.io/camouflage/) for more details.

## Contributing

All and any relevant contributions to the project are welcome. Easiest way to contribute to Camouflage is to 🌟 the project. You can also help find typos and grammatical mistakes in the documentation to earn a quick 🟩 for your Github profile.

If you'd like to get into technical nitty gritty, I have tried my best to provide relevant comments throughout the code base with a [JSDocs](https://shubhendumadhukar.github.io/camouflage-jsdocs/) available too. Sicne we are still in beta, there are frequent changes in the codebase, which might at times lead to outdated JSDocs, in which case, feel free to reach out via [discussions](https://github.com/testinggospels/camouflage/discussions) or join us on [discord](https://discord.gg/hTqXuG7dsV).

Raise an [issue](https://github.com/testinggospels/camouflage/issues/new?assignees=shubhendumadhukar&labels=bug&template=bug_report.md&title=) if you think something is not working as expected, or if you'd like to request a [new feature](https://github.com/testinggospels/camouflage/issues/new?assignees=shubhendumadhukar&labels=enhancement&template=feature_request.md&title=)

Read the detailed [contributing guide](https://github.com/testinggospels/camouflage/blob/main/CONTRIBUTING.md)

## Building from source

Camouflage is quickly approaching it's first release i.e. v1.0.0, however while it is still in beta, there might be some bugs, missed use cases, incorrect implementations of some functionalities. This is to be expected. But, the good news is that we are constantly evolving.

There might be times when latest changes have not gone to release yet. You can find such changes in the `develop` branch of the repository, which is the most updated version of Camouflage. If you'd like to get your hands on the upcoming release of Camouflage at any point, you can build it from the source. However, since this source might contain changes that are not tested yet and are not ready for use, you might want to proceed with caution.

1. Clone the repository: `git clone https://github.com/testinggospels/camouflage.git`
2. Checkout `develop` branch: `git checkout develop`
3. Install dependencies: `npm install`
4. Build the project: `npm build`
5. At this point you can run Camouflage using: `node bin/camouflage.js --config ./config.yml`
6. However if you'd like to install Camouflage globally, execute: `npm pack`
7. Install by running command: `npm install -g camouflage-server-0.0.0-development.tgz` or `npm install -g camouflage-server-0.0.0-development.zip`


## License
```
MIT License

Copyright (c) 2021 testinggospels

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
