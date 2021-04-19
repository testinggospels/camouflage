import express from "express";
import fs from "fs";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import Handlebars from "handlebars";
import logger from "../logger";

export default class Protocols {
  private app: express.Application;
  private port: number;
  private httpsPort: number;
  private grpcMocksDir: string;

  constructor(app: express.Application, port: number, httpsPort?: number) {
    this.app = app;
    this.port = port;
    this.httpsPort = httpsPort;
  }
  initHttp = (http: any): void => {
    http.createServer(this.app).listen(this.port, () => {
      logger.info(`Worker sharing HTTP server at http://localhost:${this.port}`);
      this.app.emit("server-started");
    });
  };
  initHttps = (https: any, key: string, cert: string) => {
    // If https is enabled, fetch key and cert information, create credentials and start the https server on specified port
    let privateKey = fs.readFileSync(key, "utf8");
    let certificate = fs.readFileSync(cert, "utf8");
    let credentials = { key: privateKey, cert: certificate };
    https.createServer(credentials, this.app).listen(this.httpsPort, () => {
      logger.info(`Worker sharing HTTPs server at https://localhost:${this.httpsPort}`);
    });
  };
  initGrpc = (grpcProtosDir: string, grpcMocksDir: string, grpcHost: string, grpcPort: number) => {
    this.grpcMocksDir = grpcMocksDir;
    const availableProtoFiles: string[] = fs.readdirSync(grpcProtosDir);
    let grpcObjects: grpc.GrpcObject[] = [];
    let packages: any = [];
    availableProtoFiles.forEach((availableProtoFile) => {
      let packageDef = protoLoader.loadSync(path.join(grpcProtosDir, availableProtoFile), {});
      let definition = grpc.loadPackageDefinition(packageDef);
      grpcObjects.push(definition);
    });
    grpcObjects.forEach((grpcObject: grpc.GrpcObject) => {
      Object.keys(grpcObject).forEach((availablePackage) => {
        packages.push(grpcObject[`${availablePackage}`]);
      });
    });
    const server = new grpc.Server();
    server.bindAsync(`${grpcHost}:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      logger.info(`Worker sharing gRPC server at ${grpcHost}:${grpcPort}`);
      server.start();
    });
    packages.forEach((entry: any) => {
      let keys = Object.keys(entry);
      keys = keys.filter((key) => {
        return entry[key]["service"] !== undefined;
      });
      keys.forEach((key) => {
        let service = entry[key]["service"];
        let methods = Object.keys(service);
        let methodDefinition: Record<string, any> = {};
        methods.forEach((method) => {
          methodDefinition[method] = this.camouflageMock;
        });
        server.addService(service, methodDefinition);
      });
    });
  };
  //   initHttp2 = () => {};
  //   initTcp = () => {};
  private camouflageMock = (call: any, callback: any) => {
    let handlerPath = call.call.handler.path;
    let mockFile = handlerPath.replace(".", "/");
    let mockFilePath = path.join(this.grpcMocksDir, mockFile + ".mock");
    if (fs.existsSync(mockFilePath)) {
      const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
      const fileContent = template({ request: call.request });
      callback(null, JSON.parse(fileContent));
    } else {
      logger.error(`No suitable mock file was found for ${mockFilePath}`);
    }
  };
}

