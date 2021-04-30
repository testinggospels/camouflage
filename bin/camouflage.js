#!/usr/bin/env node
const cluster = require("cluster");
const express = require("express");
const metricsServer = express();
const AggregatorRegistry = require("prom-client").AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();
var argv = require("yargs").argv;
const yaml = require("js-yaml");
const winston = require("winston");
const path = require("path");
const fs = require("fs");
var config = argv.c || argv.config;
var help = argv.h || argv.help;
const osCPUs = require("os").cpus().length;
const camouflage = require("../dist/index");
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
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(process.cwd(), "camouflage.log"),
    }),
  ],
});
let inputs = [
  config.protocols.http.mocks_dir,
  config.protocols.http.port,
  config.protocols.https.enable,
  config.protocols.http2.enable,
  config.protocols.grpc.enable,
  config.protocols.https.key,
  config.protocols.https.cert,
  config.protocols.http2.key,
  config.protocols.http2.cert,
  config.protocols.https.port,
  config.protocols.http2.port,
  config.protocols.grpc.host,
  config.protocols.grpc.port,
  config.protocols.grpc.mocks_dir,
  config.protocols.grpc.protos_dir,
  config.loglevel,
];
const numCPUs = config.cpus || 1;
const monitoringPort = config.monitoring.port || 5555;
if (numCPUs > osCPUs) {
  logger.error("Number of CPUs specified is greater than or equal to availale CPUs. Please specify a lesser number.");
  process.exit(1);
}
if (cluster.isMaster) {
  logger.info(`[${process.pid}] Master Started`);
  // If current node is a master node, use it to start X number of workers, where X comes from config
  for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
    // Attach a listner to each worker, so that if worker sends a restart message, running workers can be killed
    worker.on("message", (message) => {
      if (message === "restart") {
        for (let id in cluster.workers) {
          cluster.workers[id].process.kill();
        }
      }
    });
  }
  // If workers are killed or crashed, a new worker should replace them
  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`[${worker.process.pid}] Worker Stopped ${new Date(Date.now())}`);
    let newWorker = cluster.fork();
    // Same listener to be attached to new workers
    newWorker.on("message", (message) => {
      if (message === "restart") {
        for (let id in cluster.workers) {
          cluster.workers[id].process.kill();
        }
      }
    });
  });
  metricsServer.get("/metrics", async (req, res) => {
    try {
      const metrics = await aggregatorRegistry.clusterMetrics();
      res.set("Content-Type", aggregatorRegistry.contentType);
      res.send(metrics);
    } catch (ex) {
      res.statusCode = 500;
      res.send(ex.message);
    }
  });

  metricsServer.listen(monitoringPort);
  logger.info(`Cluster metrics server listening to ${monitoringPort}, metrics exposed on http://localhost:${monitoringPort}/metrics`);
} else {
  camouflage.start(...inputs);
}
