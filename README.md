[![NPM Download Stats](https://nodei.co/npm/camouflage-server.png?downloads=true)](https://www.npmjs.com/package/camouflage-server)

# Camouflage

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver). As the original description says, the mocking/service virtualization works on a file based structure where you simply organize your mocked HTTP responses in a bunch of mock files and it will serve them like they were coming from a real API; in this way you can write your frontends without caring too much whether your backend is really ready or not.

## Getting started

1. Install Camouflage: `npm install -g camouflage-server`
2. Start server: `camouflage --config ./config.yml`

Full Documentation: [https://fauxauldrich.github.io/camouflage/](https://fauxauldrich.github.io/camouflage/)

