import express from "express";
/**
 * Defines and registers admin/management endpoints
 */
export default class MockController {
  private app: express.Application;
  /**
   *
   * @param {express.Application} app instance of express application
   * @param {string} mocksDir location of http mocks
   * @param {string} grpcMocksDir location of grpc mocks
   */
  constructor(app: express.Application) {
    this.app = app;
    this.register();
  }
  /**
   * Registers management endpoints:
   * - GET /restart
   * - GET /ping
   * @returns {void}
   */
  private register = () => {
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
