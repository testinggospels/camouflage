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
      <h3 align="center"><a href="http://camouflage-server.herokuapp.com/">Demo</a></h3>
    </p>
</p>

## Support

[![Chat on Discord](https://img.shields.io/badge/chat-Discord-7289DA?logo=discord)](https://discord.gg/hTqXuG7dsV)

## What is Camouflage?

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver). Camouflage works on a file based endpoint configuration system, which means it allows you to create a mock endpoint by simply creating a set of directories and a mock file, using which necessary responses are generated when you call the endpoint.

## Available Features

🔥 File based mocking support for HTTP, HTTPS, HTTP2, gRPC, Thrift and websockets. 🔥

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

✅ Validation of requests and responses using your OpenApi schema's. ✅
