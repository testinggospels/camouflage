#!/usr/bin/env node
var argv = require("yargs").argv;
var help = argv.h || argv.help;
var mocks = argv.m || argv.mocks || process.cwd();
var port = argv.p || argv.port || 8080;
var httpsPort = argv.x || argv.secureport || 8443;
var enableHttps = argv.s || argv.secure || false;
var key = argv.k || argv.key;
var cert = argv.c || argv.cert;
var numCPUs = argv.n || argv.cpus || 1;
const osCPUs = require("os").cpus().length;
var info = require("./../package.json");
const camouflage = require("../dist/index");
if (help) {
  console.log(
    [
      "Camouflage v" + info.version,
      "",
      "Usage:",
      "  camouflage",
      "",
      "Optional Parameters:",
      "  -m, --mocks            - Path to mock files",
      "  -p, --port             - HTTP Port to listen on",
      "  -x, --secureport       - HTTPS Port to listen on",
      "  -s, --secure           - include https server if required",
      "  -k, --key              - server.key file if -s/--secure is set to true",
      "  -c, --cert             - server.key file if -s/--secure is set to true",
      "  -n, --cpus             - number of CPUs you want Camouflage to utilize",
      "",
      "Example:",
      "  camouflage -m './mocks' -s -k ./certs/server.key -c ./certs/server.cert",
    ].join("\n")
  );
  process.exit(1);
}
if (numCPUs > osCPUs) {
  console.log("Number of CPUs specified is greater than or equal to availale CPUs. Please specify a lesser number.");
  process.exit(1);
}
if (enableHttps) {
  if (!key || !cert) {
    console.log(
      [
        "Missing: Mocks Key or Certificate for https server",
        "Camouflage v" + info.version,
        "",
        "Usage:",
        "  camouflage",
        "",
        "Required Parameter:",
        "",
        "Optional Parameters:",
        "  -m, --mocks            - Path to mock files",
        "  -p, --port             - HTTP Port to listen on",
        "  -x, --secureport       - HTTPS Port to listen on",
        "  -s, --secure           - include https server if required",
        "  -k, --key              - server.key file if -s/--secure is set to true",
        "  -c, --cert             - server.key file if -s/--secure is set to true",
        "  -n, --cpus             - number of CPUs you want Camouflage to utilize",
        "",
        "Example:",
        "  camouflage -m './mocks' -s -k ./certs/server.key -c ./certs/server.cert",
      ].join("\n")
    );
  } else {
    camouflage.start(mocks, port, enableHttps, numCPUs, key, cert, httpsPort);
  }
} else {
  camouflage.start(mocks, port, enableHttps, numCPUs);
}

