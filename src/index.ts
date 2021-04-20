import express from "express";
import bodyParser from "body-parser";
import http from "http";
import https from "https";
import cluster from "cluster";
import child_process from "child_process";
import path from "path";
import * as expressWinston from "express-winston";
import * as winston from "winston";
import promBundle from "express-prom-bundle";
import registerHandlebars from "./handlebar/helperInit";
import Protocols from "./protocols/Protocols";
import GlobalController from "./routes/GlobalController";
import CamouflageController from "./routes/CamouflageController";
import logger from "./logger";
import { setLogLevel } from "./logger";
let site_root = path.join(child_process.execSync("npm root -g").toString().trim(), "camouflage-server", "site");

let mocksDir = "";
let grpcMocksDir = "";
let grpcProtosDir = "";
let grpcHost = "localhost";
let port = 8080;
let httpsPort = 8443;
let grpcPort = 4312;
const app = express();
app.use(
  promBundle({
    includeMethod: true,
    includePath: true,
    promClient: {
      collectDefaultMetrics: {},
    },
  })
);
app.use(bodyParser.json());
app.use(express.static(site_root));

function start(
  inputMocksDir: string,
  inputPort: number,
  enableHttps: boolean,
  enableGrpc: boolean,
  numCPUs: number,
  key?: string,
  cert?: string,
  inputHttpsPort?: number,
  inputGrpcPort?: number,
  inputGrpcMocksDir?: string,
  inputGrpcProtosDir?: string,
  loglevel?: string
) {
  setLogLevel(loglevel);
  app.use(
    expressWinston.logger({
      level: loglevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((log) => `${log.timestamp} ${log.level}: ${log.message}` + (log.splat !== undefined ? `${log.splat}` : " "))
      ),
      transports: [new winston.transports.Console()],
      msg: "HTTP {{req.method}} {{req.url}}",
      expressFormat: true,
      colorize: true,
    })
  );
  if (cluster.isMaster) {
    logger.info(`[${process.pid}] Master Started`);
    for (let i = 0; i < numCPUs; i++) {
      let worker = cluster.fork();
      worker.on("message", (message) => {
        for (let id in cluster.workers) {
          cluster.workers[id].process.kill();
        }
      });
    }
    cluster.on("exit", (worker, code, signal) => {
      logger.warn(`[${worker.process.pid}] Worker Stopped ${new Date(Date.now())}`);
      let newWorker = cluster.fork();
      newWorker.on("message", (message) => {
        for (let id in cluster.workers) {
          cluster.workers[id].process.kill();
        }
      });
    });
  } else {
    logger.info(`[${process.pid}] Worker started`);
    // Update the mocksDir with the input provided by user via -m or --mocks parameter via command line while starting the server
    mocksDir = inputMocksDir;
    grpcMocksDir = inputGrpcMocksDir;
    grpcProtosDir = inputGrpcProtosDir;
    httpsPort = inputHttpsPort ? inputHttpsPort : httpsPort;
    grpcPort = inputGrpcPort ? inputGrpcPort : grpcPort;
    // Default port is 8080 but should be updated to a different port if user provides the input for the optional parameter -p or --port
    port = inputPort;
    // Define route for root which would in future host a single page UI to manage the mocks
    app.get("/", (req: express.Request, res: express.Response) => {
      res.sendFile("index.html", { root: site_root });
    });
    // Register Handlebars
    registerHandlebars();
    // Register Controllers
    new CamouflageController(app, mocksDir, grpcMocksDir);
    new GlobalController(app, mocksDir);
    // Start the http server on the specified port
    const protocols = new Protocols(app, port, httpsPort);
    protocols.initHttp(http);
    if (enableHttps) {
      protocols.initHttps(https, key, cert);
    }
    if (enableGrpc) {
      protocols.initGrpc(grpcProtosDir, grpcMocksDir, grpcHost, grpcPort);
    }
  }
}
//Export the start function which should be called from bin/camouflage.js with required parameters
module.exports.start = start;
//Export app for testing purpose
module.exports.app = app;

