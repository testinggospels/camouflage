import express from "express";
import bodyParser from "body-parser";
import http from "http";
import https from "https";
import cluster from "cluster";
// @ts-ignore
import promMid from "express-prometheus-middleware";
import "./handlebar/helperInit";
import Protocols from "./protocols/Protocols";
import GlobalController from "./routes/GlobalController";
import CamouflageController from "./routes/CamouflageController";

let mocksDir = "";
let port = 8080;
let httpsPort = 8443;
const app = express();
app.use(bodyParser.json());
app.use(
  promMid({
    metricsPath: "/metrics",
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  })
);
function start(inputMocksDir: string, inputPort: number, enableHttps: boolean, numCPUs: number, key?: string, cert?: string, inputHttpsPort?: number) {
  // Update the mocksDir with the input provided by user via -m or --mocks parameter via command line while starting the server
  mocksDir = inputMocksDir;
  httpsPort = inputHttpsPort ? inputHttpsPort : httpsPort;
  // Default port is 8080 but should be updated to a different port if user provides the input for the optional parameter -p or --port
  port = inputPort;
  // Define route for root which would in future host a single page UI to manage the mocks
  app.get("/", (req: express.Request, res: express.Response) => {
    res.redirect("/mocks");
  });
  // Register Controllers
  new CamouflageController(app, mocksDir);
  new GlobalController(app, mocksDir);
  // Start the http server on the specified port
  if (cluster.isMaster) {
    console.log(`[${process.pid}] Master Started`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      cluster.fork();
      console.log(`[${worker.process.pid}] Worker Stopped`);
    });
  } else {
    console.log(`[${process.pid}] Worker started`);
    const protocols = new Protocols(app, port, httpsPort);
    protocols.initHttp(http);
    if (enableHttps) {
      protocols.initHttps(https, key, cert);
    }
  }
}
//Export the start function which should be called from bin/camouflage.js with required parameters
module.exports.start = start;
//Export app for testing purpose
module.exports.app = app;

