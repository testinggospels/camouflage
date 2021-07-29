import express from "express";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
// @ts-ignore
import spdy from "spdy";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import WebSocket from "ws";
import logger from "../logger";
import GrpcParser from "../parser/GrpcParser";
import { IncomingMessage } from "http";
import WebsocketParser from "../parser/WebsocketParser";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
const clients: string[] = [];
/**
 * Defines all protocols:
 * Currently active:
 * - HTTP
 * - HTTPS
 * - HTTP2
 * - gRPC
 * - Websocket
 * @param {string} grpcMocksDir location of grpc mocks, not initialized as constructor variable, because grpc is an optional protocol
 *                              instead it will be initialized in initGRPC method, if called.
 */
export default class Protocols {
  private app: express.Application;
  private port: number;
  private httpsPort: number;
  private grpcMocksDir: string;
  /**
   *
   * @param {express.Application} app Express application to form the listener for http and https server
   * @param {number} port HTTP server port
   * @param {number} httpsPort HTTPs server port - currently initialized in constructor optionally but in future it'll be initialized if https is enabled
   */
  constructor(app: express.Application, port: number, httpsPort?: number) {
    this.app = app;
    this.port = port;
    this.httpsPort = httpsPort;
  }
  /**
   * Initialize HTTP server at specified port
   * @returns {void}
   */
  initHttp = (): void => {
    http.createServer(this.app).listen(this.port, () => {
      logger.info(`Worker sharing HTTP server at http://localhost:${this.port} ⛳`);
      this.app.emit("server-started");
    });
  };
  /**
   * Initialize HTTPs server at specified port
   * @param {string} key location of server.key file
   * @param {string} cert location of server.cert file
   * @returns {void}
   */
  initHttps = (key: string, cert: string) => {
    let privateKey = fs.readFileSync(key, "utf8");
    let certificate = fs.readFileSync(cert, "utf8");
    let credentials = { key: privateKey, cert: certificate };
    https.createServer(credentials, this.app).listen(this.httpsPort, () => {
      logger.info(`Worker sharing HTTPs server at https://localhost:${this.httpsPort} ⛳`);
    });
  };
  /**
   * Initializes a gRPC server at specified host and port
   * - Set location of gRPC mocks to be used by metod camouflageMock
   * - Get an array of all .protofile in specified protos directory
   * - Run forEach on the array and read and load package definition for each protofile in protos dir
   * - For each definition, get the package details from all .proto files and store in a master packages object
   * - Initialize a grpcServer
   * - Create an insecure binding to given grpc host and port, and start the server
   * - For each package, filter out objects with service definition, discard rest
   * - For each method in the service definition, attach a generic handler, finally add service to running server
   * - Handlers will vary based on the type of request, i.e. unary, bidi streams or one sided streams
   * - Finally add all services to the server
   * @param {string} grpcProtosDir location of proto files
   * @param {string} grpcMocksDir location of mock files for grpc
   * @param {string} grpcHost grpc host
   * @param {number} grpcPort grpc port
   */
  initGrpc = (grpcProtosDir: string, grpcMocksDir: string, grpcHost: string, grpcPort: number, protoIgnore: string[]) => {
    this.grpcMocksDir = grpcMocksDir;
    const grpcParser: GrpcParser = new GrpcParser(this.grpcMocksDir);
    const availableProtoFiles: string[] = fromDir(grpcProtosDir, ".proto", protoIgnore);
    let grpcObjects: grpc.GrpcObject[] = [];
    let packages: any = [];
    availableProtoFiles.forEach((availableProtoFile) => {
      let packageDef = protoLoader.loadSync(path.resolve(availableProtoFile), {});
      let definition = grpc.loadPackageDefinition(packageDef);
      grpcObjects.push(definition);
    });
    grpcObjects.forEach((grpcObject: grpc.GrpcObject) => {
      Object.keys(grpcObject).forEach((availablePackage) => {
        packages.push(grpcObject[`${availablePackage}`]);
      });
    });
    const server = new grpc.Server();
    server.bindAsync(`${grpcHost}:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err) => {
      if (err) logger.error(err.message);
      logger.info(`Worker sharing gRPC server at ${grpcHost}:${grpcPort} ⛳`);
      server.start();
    });
    packages.forEach((pkg: any) => {
      let service: any = [];
      let getObject = function (pkg: any) {
        for (var prop in pkg) {
          if (prop == 'service') {
            service.push(pkg[prop]);
            break;
          } else {
            if (pkg[prop] instanceof Object) {
              getObject(pkg[prop]);
            }
          }
        }
      }
      getObject(pkg);
      service.forEach((service: any) => {
        let methods = Object.keys(service);
        methods.forEach((method) => {
          if (!service[method]["responseStream"] && !service[method]["requestStream"]) {
            if (server.register(service[method]["path"], grpcParser.camouflageMock, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'unary')) {
              logger.debug(`Registering Unary method: ${method}`);
            } else {
              logger.warn(`Not re-registering ${method}. Already registered.`)
            }
          }
          if (service[method]["responseStream"] && !service[method]["requestStream"]) {
            if (server.register(service[method]["path"], grpcParser.camouflageMockServerStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'serverStream')) {
              logger.debug(`Registering method with server side streaming: ${method}`);
            } else {
              logger.warn(`Not re-registering ${method}. Already registered.`)
            }
          }
          if (!service[method]["responseStream"] && service[method]["requestStream"]) {
            if (server.register(service[method]["path"], grpcParser.camouflageMockClientStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'clientStream')) {
              logger.debug(`Registering method with client side streaming: ${method}`);
            } else {
              logger.warn(`Not re-registering ${method}. Already registered.`)
            }
          }
          if (service[method]["responseStream"] && service[method]["requestStream"]) {
            if (server.register(service[method]["path"], grpcParser.camouflageMockBidiStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'bidi')) {
              logger.debug(`Registering method with BIDI streaming: ${method}`);
            } else {
              logger.warn(`Not re-registering ${method}. Already registered.`)
            }
          }
        });
      });
    });
  };
  /**
   * Initializes an HTTP2 server
   * @param {number} http2Port
   * @param {string} http2key
   * @param {string} http2cert
   */
  initHttp2 = (http2Port: number, http2key: string, http2cert: string) => {
    spdy
      .createServer(
        {
          key: fs.readFileSync(http2key),
          cert: fs.readFileSync(http2cert),
        },
        this.app
      )
      .listen(http2Port, (err: any) => {
        if (err) logger.error(err.message);
        logger.info(`Worker sharing HTTP2 server at https://localhost:${http2Port} ⛳`);
      });
  };
  /**
   * Initializes a WebSocketserver
   * @param {number} wsPort
   * @param {string} wsMockDir
   */
  initws = (wsPort: number, wsMockDir: string) => {
    const WebSocket = require("ws");
    const wss = new WebSocket.Server({ port: wsPort });
    logger.info(`Worker sharing WS server at ws://localhost:${wsPort} ⛳`);
    const websocketParser = new WebsocketParser(wss);
    wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      const clientId = uuidv4();
      clients.push(clientId);
      // @ts-ignore
      ws["clientId"] = clientId;
      let mockFile = path.join(wsMockDir, ...request.url.substring(1).split("/"), "connection.mock");
      if (fs.existsSync(mockFile)) {
        websocketParser.sendConnect(ws, request, clients, clientId, "joining", mockFile);
      } else {
        websocketParser.sendConnect(ws, request, clients, clientId, "joining");
      }
      ws.on("message", (message) => {
        logger.debug(`Client sent message ${message}`);
        mockFile = path.join(wsMockDir, ...request.url.substring(1).split("/"), "message.mock");
        if (fs.existsSync(mockFile)) {
          websocketParser.send(mockFile, ws, request, message);
        } else {
          logger.error(`No suitable message.mock file found for ${request.url}`);
        }
      });
      ws.on("close", () => {
        clients.splice(clients.indexOf(clientId), 1);
        websocketParser.sendConnect(ws, request, clients, clientId, "leaving");
      });
    });
  };
}
let availableFiles: string[] = [];
let fromDir = function (startPath: string, filter: string, protoIgnore: string[]) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      fromDir(filename, filter, protoIgnore);
    }
    else if (filename.indexOf(filter) >= 0 && !protoIgnore.includes(path.resolve(filename))) {
      let protoFile = path.resolve(filename)
      logger.debug(`Found protofile: ${protoFile}`)
      availableFiles.push(protoFile)
    }
  }
  return availableFiles;
}