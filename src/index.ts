// Import dependencies
import express from "express";
import cluster from "cluster";
import path from "path";
import * as expressWinston from "express-winston";
import registerHandlebars from "./handlebar";
import Protocols from "./protocols";
import GlobalController from "./routes/GlobalController";
import CamouflageController from "./routes/CamouflageController";
import BackupScheduler from "./BackupScheduler";
import logger from "./logger";
import { setLogLevel } from "./logger";
import child_process from "child_process";
// @ts-ignore
import apicache from "apicache";
// @ts-ignore
import * as filemanager from "@opuscapita/filemanager-server";
const filemanagerMiddleware = filemanager.middleware;
// @ts-ignore
import swStats from "swagger-stats";
// @ts-ignore
import cors from 'cors';
/**
 * Gets the location of documentation folder
 */
let ui_root = path.join(child_process.execSync("npm root -g").toString().trim(), "camouflage-server", "public");

// Initialize variables with default values
let mocksDir = "";
let grpcMocksDir = "";
let wsMocksDir = "";
let grpcProtosDir = "";
let grpcHost = "localhost";
let port = 8080;
let httpsPort = 8443;
let http2Port = 8081;
let grpcPort = 4312;
let wsPort = 8082;
const app = express();
// Configure logging for express requests
app.use(
  expressWinston.logger({
    level: () => "level",
    winstonInstance: logger,
    statusLevels: { error: "error", success: "debug", warn: "warn" },
    msg: "HTTP {{req.method}} {{req.path}} :: Query Parameters: {{JSON.stringify(req.query)}} | Request Headers {{JSON.stringify(req.headers)}} | Request Body {{JSON.stringify(req.body)}}",
  })
);
// Configure swagger-stats middleware for monitoring
app.use(
  swStats.getMiddleware({
    name: "Camouflage",
    uriPath: "/monitoring",
  })
);
// Configure express to understand json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configure public directory as a source for static resources for file-explorer (eg. js, css, image)
app.use(express.static(ui_root));
const compression = require("compression");
app.use(compression());
let cache = apicache.middleware;
app.get("/stats", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swStats.getCoreStats());
});
/**
 * Initializes required variables and starts a 1 master X workers configuration
 * @param {string} inputMocksDir Mocks directory from config file, overrides default mocksDir
 * @param {number} inputPort Input http port, overrides default 8080 port
 * @param {boolean} enableHttps true if https is to be enabled
 * @param {boolean} enableHttp2 true if http2 is to be enabled
 * @param {boolean} enableGrpc true if grpc is to be enabled
 * @param {boolean} enableWs true if websockets is to be enabled
 * @param {boolean} enableCache true if cache is to be enabled
 * @param {boolean} enableInjection true if code injection is to be enabled
 * @param {string[]} origins array of allowed origins
 * @param {string} key location of server.key file if https is enabled
 * @param {string} cert location of server.cert file if https is enabled
 * @param {number} inputHttpsPort Input https port, overrides httpsPort
 * @param {number} inputHttp2Port Input http2 port, overrides httpsPort
 * @param {string} inputGrpcHost Input gRPC host, overrides grpcHost
 * @param {number} inputGrpcPort Input gRPC port, overrides grpcPort
 * @param {string} inputGrpcMocksDir Input gRPC mocks directory location, overrides grpcMocksDir
 * @param {string} inputGrpcProtosDir Input gRPC protos directory location, overrides grpcProtos
 * @param {string} loglevel Desired loglevel
 * @param {string} backupEnable true if backup is enabled
 * @param {string} backupCron cron schedule for backup
 * @param {string} configFilePath location of config file
 * @param {string} extHelpers location of the external handlebars json file
 * @param {number} cacheTtl cache age in seconds
 */
const start = (
  inputMocksDir: string,
  inputWsMocksDir: string,
  inputPort: number,
  enableHttp: boolean,
  enableHttps: boolean,
  enableHttp2: boolean,
  enableGrpc: boolean,
  enableWs: boolean,
  enableCache: boolean,
  enableInjection: boolean,
  origins: string[],
  protoIgnore: string[],
  key?: string,
  cert?: string,
  inputHttpsPort?: number,
  inputHttp2Port?: number,
  inputWsPort?: number,
  inputGrpcHost?: string,
  inputGrpcPort?: number,
  inputGrpcMocksDir?: string,
  inputGrpcProtosDir?: string,
  loglevel?: string,
  backupEnable?: boolean,
  backupCron?: string,
  configFilePath?: string,
  extHelpers?: string,
  cacheTtl?: number
) => {
  const config = {
    fsRoot: path.resolve(mocksDir),
    readOnly: false,
    rootName: "Camouflage",
    logger: logger,
  };
  // Configure cors
  if (origins.length !== 0) {
    logger.info(`CORS enabled for ${origins.join(", ")}`)
    app.use(cors({
      origin: origins
    }));
  }
  if (enableCache) {
    logger.info(`Cache enabled with TTL ${cacheTtl} seconds`)
    app.use(cache(`${cacheTtl} seconds`));
  }
  app.use(filemanagerMiddleware(config));
  // Set log level to the configured level from config.yaml
  setLogLevel(loglevel);
  logger.info(`[${process.pid}] Worker started`);
  // Replace the default values for defined variables with actual values provided as input from config
  mocksDir = inputMocksDir;
  grpcMocksDir = inputGrpcMocksDir;
  wsMocksDir = inputWsMocksDir;
  grpcProtosDir = inputGrpcProtosDir;
  httpsPort = inputHttpsPort ? inputHttpsPort : httpsPort;
  http2Port = inputHttp2Port ? inputHttp2Port : http2Port;
  grpcHost = inputGrpcHost ? inputGrpcHost : grpcHost;
  grpcPort = inputGrpcPort ? inputGrpcPort : grpcPort;
  wsPort = inputWsPort ? inputWsPort : wsPort;
  port = inputPort;
  swStats.getPromClient().register.setDefaultLabels({ workerId: typeof cluster.worker !== "undefined" ? cluster.worker.id : 0 });
  // Define route for /ui to host a single page UI to manage the mocks
  app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: ui_root });
  });
  // Register Handlebars
  registerHandlebars(extHelpers, enableInjection);
  // Register Controllers
  new CamouflageController(app, mocksDir, grpcMocksDir);
  new GlobalController(app, mocksDir);
  // Start the http server on the specified port
  const protocols = new Protocols(app, port, httpsPort);
  if (enableHttp) {
    protocols.initHttp();
  }
  // If https protocol is enabled, start https server with additional inputs
  if (enableHttps) {
    protocols.initHttps(key, cert);
  }
  // If https protocol is enabled, start https server with additional inputs
  if (enableHttp2) {
    protocols.initHttp2(http2Port, key, cert);
  }
  // If grpc protocol is enabled, start grpc server with additional inputs
  if (enableGrpc) {
    protocols.initGrpc(grpcProtosDir, grpcMocksDir, grpcHost, grpcPort, protoIgnore);
  }
  // If websocket protocol is enabled, start ws server with additional inputs
  if (enableWs) {
    protocols.initws(wsPort, wsMocksDir);
  }
  // If backup is enabled, schedule a cron job to copy file to backup directory
  if (backupEnable) {
    const backupScheduler: BackupScheduler = new BackupScheduler(backupCron, mocksDir, grpcMocksDir, grpcProtosDir, wsMocksDir, key, cert, configFilePath);
    backupScheduler.schedule(enableHttps, enableHttp2, enableGrpc, enableWs);
  }
};
/**
 * Exports the start function which should be called from bin/camouflage.js with required parameters
 */
module.exports.start = start;
/**
 * Exports app for testing purpose
 */
module.exports.app = app;