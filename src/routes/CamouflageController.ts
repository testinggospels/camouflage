import express from "express";
import fs from "fs";
import path from "path";
//Create routes to provide details of available mocks
export default class MockController {
  private app: express.Application;
  private mocksDir: string;
  constructor(app: express.Application, mocksDir: string) {
    this.app = app;
    this.mocksDir = mocksDir;
    this.register();
  }
  private register = () => {
    this.app.get("/mocks", (req: express.Request, res: express.Response) => {
      let results: string[] | any = walk(this.mocksDir);
      results = results.map((result: any) => {
        result = result.replace(this.mocksDir, "");
        result = result.replace(".mock", "");
        result = result.replace("__", "*");
        let api = result.split("/");
        let method = api.pop();
        return { method: method, basePath: api.join("/") };
      });
      let response = {
        mocks: results,
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

