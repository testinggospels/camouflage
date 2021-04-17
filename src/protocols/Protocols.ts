import express from "express";
import fs from "fs";

export default class Protocols {
  private app: express.Application;
  private port: number;
  private httpsPort: number;
  constructor(app: express.Application, port: number, httpsPort?: number) {
    this.app = app;
    this.port = port;
    this.httpsPort = httpsPort;
  }
  initHttp = (http: any): void => {
    http.createServer(this.app).listen(this.port, () => {
      console.log(`Worker sharing HTTP server at http://localhost:${this.port}`);
      this.app.emit("server-started");
    });
  };
  initHttps = (https: any, key: string, cert: string) => {
    // If https is enabled, fetch key and cert information, create credentials and start the https server on specified port
    let privateKey = fs.readFileSync(key, "utf8");
    let certificate = fs.readFileSync(cert, "utf8");
    let credentials = { key: privateKey, cert: certificate };
    https.createServer(credentials, this.app).listen(this.httpsPort, () => {
      console.log(`Worker sharing HTTPs server at https://localhost:${this.httpsPort}`);
    });
  };
  //   initHttp2 = () => {};
  //   initTcp = () => {};
}

