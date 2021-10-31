import express from "express";
import fs from "fs";
import path from "path";
/**
 * Defines and registers admin/management endpoints
 */
export default class MockController {
  private app: express.Application;
  private mocksDir: string;
  private grpcMocksDir: string;
  /**
   *
   * @param {express.Application} app instance of express application
   * @param {string} mocksDir location of http mocks
   * @param {string} grpcMocksDir location of grpc mocks
   */
  constructor(app: express.Application, mocksDir: string, grpcMocksDir: string) {
    this.app = app;
    this.mocksDir = mocksDir;
    this.grpcMocksDir = grpcMocksDir;
    this.register();
  }
  /**
   * Registers management endpoints:
   * - GET /mocks - DEPRECATED
   * - DELETE /mocks - DEPRECATED
   * - GET /restart
   * - GET /ping
   * @returns {void}
   */
  private register = () => {
    /**
     * Gets the list of available http and grpc mocks - deprecated
     */
    this.app.get("/mocks", (req: express.Request, res: express.Response) => {
      let results: string[] | any = walk(this.mocksDir);
      let grpcResults: string[] | any = walk(this.grpcMocksDir);
      results = results.map((result: any) => {
        result = result.replace(this.mocksDir, "");
        result = result.replace(".mock", "");
        result = result.replace("__", "*");
        const api = result.split("/");
        const method = api.pop();
        return { method: method, basePath: api.join("/") };
      });
      grpcResults = grpcResults.map((grpcResult: any) => {
        grpcResult = grpcResult.replace(this.grpcMocksDir, "");
        grpcResult = grpcResult.replace(".mock", "");
        const [packageName, serviceName, methodName] = removeBlanks(grpcResult.split("/"));
        console.log(removeBlanks(grpcResult.split("/")));
        return { packageName: packageName, serviceName: serviceName, methodName: methodName };
      });
      const response = {
        httpMocks: results,
        grpcMocks: grpcResults,
        metricsEndpoint: "/metrics",
      };
      res.send(response);
    });
    /**
     * Deletes a mock with it's path and http method - deprecated
     */
    this.app.delete("/mocks", (req: express.Request, res: express.Response) => {
      const mock = path.join(this.mocksDir, req.body.basePath.replace("*", "__"), req.body.method + ".mock");
      let status = "Mock Deleted Successfully";
      try {
        fs.unlinkSync(path.resolve(mock));
      } catch (err) {
        status = err;
      }
      res.send({ status: status, fileFound: fs.existsSync(mock) });
    });
    /**
     * Send message to master to kill all running workers and replace them with new workers
     * This is specifically for grpc services
     * In case a new protofile is added. server needs to be restarted to register new services
     */
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
    /**
     * Get the status and uptime for a running process
     */
    this.app.get("/ping", (req: express.Request, res: express.Response) => {
      res.send({
        message: "I am alive.",
        pid: process.pid,
        currentProcessUptime: process.uptime(),
      });
    });
  };
}

/**
 * Recursively prepares a list of files in a given directory
 * @param dir mocksDir
 * @returns array of files in a given directory
 */
const walk = function (dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file: string) {
    file = dir + "/" + file;
    const stat = fs.statSync(file);
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

const removeBlanks = (array: Array<any>) => {
  return array.filter(function (i) {
    return i;
  });
};
