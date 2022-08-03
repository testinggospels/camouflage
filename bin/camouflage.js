#!/usr/bin/env node
const child_process = require("child_process");
const cluster = require("cluster");
const express = require("express");
const metricsServer = express();
const AggregatorRegistry = require("prom-client").AggregatorRegistry;
const aggregatorRegistry = new AggregatorRegistry();
const argv = require("yargs").argv;
const yaml = require("js-yaml");
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const os = require("os");
const configFile = argv.c || argv.config;
const help = argv.h || argv.help;
const init = argv._[0] === "init" ? "init" : null;
const restore = argv._[0] === "restore" ? "restore" : null;
const osCPUs = require("os").cpus().length;
const camouflage = require("../dist/index");
const fse = require("fs-extra");
let site_root = path.join(child_process.execSync("npm root -g").toString().trim(), "camouflage-server");
let protoIgnore = [];
let plconfig = {};
/**
 * If user runs command camouflage -h, this if block will log the required format for a config.yml file and exit.
 */
if (help) {
  console.log(
    [
      "Create a config.yml file as shown in the sample yml below",
      `loglevel: info`,
      `cpus: 1`,
      `monitoring:`,
      ` port: 5555`,
      `ssl:`,
      ` cert: "./certs/server.cert"`,
      ` key: "./certs/server.key"`,
      `protocols:`,
      ` http:`,
      `   enable: true`,
      `   mocks_dir: "./mocks"`,
      `   port: 8080`,
      ` https:`,
      `   enable: false`,
      `   port: 8443`,
      ` http2:`,
      `   enable: true`,
      `   port: 8081`,
      ` ws:`,
      `   enable: false`,
      `   mocks_dir: "./ws_mocks"`,
      `   port: 8082`,
      ` grpc:`,
      `   enable: false`,
      `   port: 5000`,
      `   mocks_dir: "./grpc/mocks"`,
      `   protos_dir: "./grpc/protos"`,
      ` ws:`,
      `   enable: false`,
      `backup:`,
      `  enable: true`,
      `  cron: "0 * * * *" # Hourly Backup`,
      `cache:`,
      `  enable: false`,
      `  ttl_seconds: 300`,
      `injection:`,
      `  enable: false`,
      `ext_helpers: "./custom_handlebar.json" # Remove if not needed`,
      `origins:`,
      `  - http://localhost:3000`,
      `  - http://localhost:3001`,
      `  - http://localhost:5000`
    ].join("\n")
  );
  process.exit(0);
}
/**
 * If user runs command camouflage init and if the current working directory is empty,
 * this if block will copy mocks, grpc, config.yml from the globally installed camouflage source files.
 * And it will create an empty directory for certs, where users would place their generated server.cert and server.key files.
 * If the directory is not empty, application will exit with an error message.
 */
if (init) {
  if (fs.readdirSync(path.resolve(process.cwd())).length === 0) {
    if (!fs.existsSync(site_root)) {
      site_root = path.join(require('os').homedir(), ".config", "yarn", "global", "node_modules", "camouflage-server")
    }
    fse.copySync(path.join(site_root, "mocks"), path.join(process.cwd(), "mocks"));
    fse.copySync(path.join(site_root, "grpc"), path.join(process.cwd(), "grpc"));
    fse.copySync(path.join(site_root, "ws_mocks"), path.join(process.cwd(), "ws_mocks"));
    fse.copySync(path.join(site_root, "thrift"), path.join(process.cwd(), "thrift"));
    fse.copySync(path.join(site_root, "config.yml"), path.join(process.cwd(), "config.yml"));
    fse.copySync(path.join(site_root, "custom_handlebar.json"), path.join(process.cwd(), "custom_handlebar.json"));
    fse.copySync(path.join(site_root, "plconfig.js"), path.join(process.cwd(), "plconfig.js"));
    fse.copySync(path.join(site_root, ".protoignore"), path.join(process.cwd(), ".protoignore"));
    fse.mkdirSync(path.join(process.cwd(), "certs"));
  } else {
    console.error("Current directory is not empty. Camouflage cannot initialize a project in a non empty directory.");
  }
  process.exit(0);
}

/**
 * If user runs command camouflage restore, this block will look for a .camouflage_backup directory
 * in users' home directory. If not found, it will log an error and exit, else it'll copy the contents
 * of the backup directory to the mocks/grpc mocks/certs directories, as defined in config.yml file
 */
if (restore) {
  if (fs.existsSync(path.resolve(os.homedir(), ".camouflage_backup"))) {
    console.log("Restoring from previous backup.");
    try {
      fse.copySync(path.resolve(os.homedir(), ".camouflage_backup"), process.cwd());
    } catch (err) {
      console.log("Failed to restore. ", err.message)
    }
    console.log("Restore complete.");
  } else {
    console.error("No existing backup found.");
  }
  process.exit(0);
}
/**
 * If config file is not passed while starting the app, this block will log an error message and exit.
 */
if (!configFile) {
  console.error("Please provide a config file.");
  process.exit(1);
}
const project_root = path.dirname(path.resolve(configFile));
if (fs.existsSync(path.join(project_root, ".protoignore"))) {
  let lines = fs.readFileSync(path.join(project_root, ".protoignore"), "utf-8").toString();
  lines = lines.split(/\r?\n/).filter((line) => line.trim() !== "" && line.charAt(0) !== "#");
  lines.forEach(line => {
    protoIgnore.push(path.resolve(line))
  });
}
if (fs.existsSync(path.join(project_root, "plconfig.js"))) {
  let config = require(path.join(project_root, "plconfig.js"));
  plconfig = typeof config.plconfig !== 'undefined' ? config.plconfig : {};
}
/**
 * If a valid config file is found, load the data using yaml loader
 */
config = yaml.load(fs.readFileSync(configFile, "utf-8"));
if (config.ext_data_source && config.ext_data_source.pg) {
  const { host, port, user, password, database } = config.ext_data_source.pg
  process.env.PGHOST = host;
  process.env.PGUSER = user;
  process.env.PGDATABASE = database;
  process.env.PGPASSWORD = password;
  process.env.PGPORT = port;
}
/**
 * Define logger with specified configured log level
 */
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
/**
 * Create a configuration array in the order of parameters as defined by start() function in main app.
 * The reason we are storing the parameters in an is to have a error check in case of undefined values,
 * before we actually pass the values to start() function. If all values are passed correctly,
 * start() function can be called by simply spreading the array ...inputs
 */
let inputs = [
  protoIgnore,
  plconfig,
  configFile,
];
/**
 * Number of cpus to be defined to spin up workers accordingly. If number of CPUs specified is greater
 * than available number of cores, log an error and exit. Default value 1.
 * Fetch monitoring port for aggregated metrics (prometheus). Default value 5555.
 */
const numCPUs = config.cpus || 1;
const monitoringPort = config.monitoring.port || 5555;
if (numCPUs > osCPUs) {
  logger.error("Number of CPUs specified is greater than or equal to availale CPUs. Please specify a lesser number.");
  process.exit(1);
}
/**
 * Spin up 1 master and n workers, where n is defined by numCPUs variable.
 * If the instance is master, debug log configuration parameters.
 */
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
  if (monitoringPort > 0) {
    /**
       * Define a metrics server to be used to gather and publish aggregated prometheus metrics.
       * Per worker metrics are also avaulable via a UI, but only useful if running with single worker instance.
       */
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
    /**
     * Start metricsServer on specified port
     */
    metricsServer.listen(monitoringPort);
    logger.info(`Cluster metrics server listening to ${monitoringPort}, metrics exposed on http://localhost:${monitoringPort}/metrics . Set a negative value for config.monitoring.port to enable monitoring `);
  } else {
    logger.info(`Metrics server is disabled. Set a positive value for config.monitoring.port to enable monitoring.`);
  }
} else {
  /**
   * If all checks pass and process has not exited yet, and the cluster instance type is of worker,
   * Start the main application with the required parameters
   */
  camouflage.start(...inputs);
}
