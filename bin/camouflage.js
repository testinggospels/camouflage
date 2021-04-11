#!/usr/bin/env node
var argv = require("yargs").argv;
var mocks = argv.m || argv.mocks;
var port = argv.p || argv.port || 8080;
var info = require("./../package.json");
const camouflage = require("../dist/index");
if (!mocks) {
  console.log(
    [
      "Camouflage v" + info.version,
      "",
      "Usage:",
      "  camouflage -p PORT -m PATH",
      "",
      "Required Parameter:",
      "  -m, --mocks=PATH   - Path to mock files",
      "Optional Parameter:",
      "  -p, --port=PORT    - Port to listen on",
      "",
      "Example:",
      "  camouflage -p 8080 -m './mocks'",
    ].join("\n")
  );
} else {
  camouflage.start(mocks, port);
}

