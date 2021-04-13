import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import http from "http";
import https from "https";
import "./handlebar/helperInit";
import { Parser } from "./parser/parserDefinition";
let mocksDir = "";
let port = 8080;
let httpsPort = 8443;
const app = express();
app.use(bodyParser.json());

function start(inputMocksDir: string, inputPort: number, enableHttps: boolean, key?: string, cert?: string, inputHttpsPort?: number) {
  // Update the mocksDir with the input provided by user via -m or --mocks parameter via command line while starting the server
  mocksDir = inputMocksDir;
  httpsPort = inputHttpsPort ? inputHttpsPort : httpsPort;
  // Default port is 8080 but should be updated to a different port if user provides the input for the optional parameter -p or --port
  port = inputPort;
  // Define route for root which would in future host a single page UI to manage the mocks
  app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: "./public" });
  });
  // Define a generic route for all get requests
  /**
   * Following holds true for all the generic routes i.e. GET, POST, DELETE, PUT
   * We create a parser object by initializing our Parser class with request, response and mocksDir objects
   * The parser object in turn will give us access to the path of a matched directory for an incoming request.
   * Depending on the HTTP Method of the incoming request we append /GET.mock, /POST.mock, /DELETE.mock or /PUT.mock to the matched directory
   * Parse object also gives us access to a method getResponse which does the following tasks:
   *   - Read the response from the specified file
   *   - Run all the handlebars compilations as required.
   *   - Generate a HTTP Response
   *   - Send the response to client.
   */
  app.get("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getMatchedDir() + "/GET.mock";
    parser.getResponse(mockFile);
  });
  // Define a generic route for all post requests
  app.post("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getMatchedDir() + "/POST.mock";
    parser.getResponse(mockFile);
  });
  // Define a generic route for all put requests
  app.put("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getMatchedDir() + "/PUT.mock";
    parser.getResponse(mockFile);
  });
  // Define a generic route for all delete requests
  app.delete("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getMatchedDir() + "/DELETE.mock";
    parser.getResponse(mockFile);
  });
  // Start the http server on the specified port
  http.createServer(app).listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
  // If https is enabled, fetch key and cert information, create credentials and start the https server on specified port
  if (enableHttps) {
    let privateKey = fs.readFileSync(key, "utf8");
    let certificate = fs.readFileSync(cert, "utf8");
    let credentials = { key: privateKey, cert: certificate };
    https.createServer(credentials, app).listen(httpsPort, () => {
      console.log(`server started at https://localhost:${httpsPort}`);
    });
  }
  // app.listen(port, () => {
  //   console.log(`server started at http://localhost:${port}`);
  // });
}
//Export the start function which should be called from bin/camouflage.js with required parameters
module.exports.start = start;

