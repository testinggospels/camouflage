#!/usr/bin/env node
var argv = require("yargs").argv;
const yaml = require("js-yaml");
const winston = require("winston");
const fs = require("fs");
var config = argv.c || argv.config;
var help = argv.h || argv.help;
const osCPUs = require("os").cpus().length;
if (help) {
  console.log(
    [
      "Create a config.yml file as shown in the sample yml below",
      `loglevel: 'info'`,
      `cpus: 1`,
      `protocols:`,
      ` http:`,
      `   mocks_dir: "./mocks"`,
      `   port: 8080"`,
      ` https:`,
      `   enable: false`,
      `   port: 8443`,
      `   cert: "./certs/server.cert"`,
      `   key: "./certs/server.key"`,
      ` grpc:`,
      `   enable: false`,
      `   port: 5000`,
      `   mocks_dir: "./grpc/mocks"`,
      `   protos_dir: "./grpc/protos"`,
    ].join("\n")
  );
  process.exit(1);
}
if (!config) {
  logger.error("Please provide a config file.");
  process.exit(1);
}
config = yaml.load(fs.readFileSync(config, "utf-8"));
const logger = winston.createLogger({
  level: config.loglevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((log) => `${log.timestamp} ${log.level}: ${log.message}` + (log.splat !== undefined ? `${log.splat}` : " "))
  ),
  transports: [new winston.transports.Console()],
});
let inputs = [
  config.protocols.http.mocks_dir,
  config.protocols.http.port,
  config.protocols.https.enable,
  config.protocols.grpc.enable,
  config.cpus,
  config.protocols.https.key,
  config.protocols.https.cert,
  config.protocols.https.port,
  config.protocols.grpc.port,
  config.protocols.grpc.mocks_dir,
  config.protocols.grpc.protos_dir,
  config.loglevel,
];
if (config.cpus > osCPUs) {
  logger.error("Number of CPUs specified is greater than or equal to availale CPUs. Please specify a lesser number.");
  process.exit(1);
}
const camouflage = require("../dist/index");
camouflage.start(...inputs);

