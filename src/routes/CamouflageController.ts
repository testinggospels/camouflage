import express from "express";
import fs from "fs";
import path from "path";
//Create routes to provide details of available mocks
export default class MockController {
  private app: express.Application;
  private mocksDir: string;
  private grpcMocksDir: string;
  constructor(app: express.Application, mocksDir: string, grpcMocksDir: string) {
    this.app = app;
    this.mocksDir = mocksDir;
    this.grpcMocksDir = grpcMocksDir;
    this.register();
  }
  private register = () => {
    this.app.get("/mocks", (req: express.Request, res: express.Response) => {
      let results: string[] | any = walk(this.mocksDir);
      let grpcResults: string[] | any = walk(this.grpcMocksDir);
      results = results.map((result: any) => {
        result = result.replace(this.mocksDir, "");
        result = result.replace(".mock", "");
        result = result.replace("__", "*");
        let api = result.split("/");
        let method = api.pop();
        return { method: method, basePath: api.join("/") };
      });
      grpcResults = grpcResults.map((grpcResult: any) => {
        grpcResult = grpcResult.replace(this.grpcMocksDir, "");
        grpcResult = grpcResult.replace(".mock", "");
        let [__, packageName, serviceName, methodName] = grpcResult.split("/");
        return { packageName: packageName, serviceName: serviceName, methodName: methodName };
      });
      let response = {
        httpMocks: results,
        grpcMocks: grpcResults,
        metricsEndpoint: "/metrics",
      };
      res.send(response);
    });
    this.app.delete("/mocks", (req: express.Request, res: express.Response) => {
      let mock = path.join(this.mocksDir, req.body.basePath.replace("*", "__"), req.body.method + ".mock");
      let status = "Mock Deleted Successfully";
      try {
        fs.unlinkSync(path.resolve(mock));
      } catch (err) {
        status = err;
      }
      res.send({ status: status, fileFound: fs.existsSync(mock) });
    });
    this.app.get("/restart", (req: express.Request, res: express.Response) => {
      setTimeout(() => {
        process.send("restart");
      }, 1000);
      res.send({
        message: "Restarting workers. Check /ping endpoint to validate if uptime and process id has refreshed.",
        pid: process.pid,
        currentProcessPptime: process.uptime(),
      });
    });
    this.app.get("/ping", (req: express.Request, res: express.Response) => {
      res.send({
        message: "I am alive.",
        pid: process.pid,
        currentProcessUptime: process.uptime(),
      });
    });
  };
}

var walk = function (dir: string): string[] {
  var results: string[] = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file: string) {
    file = dir + "/" + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      results.push(file);
    }
  });
  return results;
};

