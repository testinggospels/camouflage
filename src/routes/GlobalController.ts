import express from "express";
import { HttpParser } from "../parser/HttpParser";
/**
 * Defines and registers global contoller which will handle any request not handled by admin/management endpoints
 */
export default class GlobalController {
  private app: express.Application;
  private mocksDir: string;
  constructor(app: express.Application, mocksDir: string) {
    this.app = app;
    this.mocksDir = mocksDir;
    this.register();
  }
  /**
   * Define a generic route for all requests
   * Following holds true for all the generic routes i.e. GET, POST, DELETE, PUT
   * We create a parser object by initializing our Parser class with request, response and mocksDir objects
   * The parser object in turn will give us access to the path of a matched directory for an incoming request.
   * Depending on the HTTP Method of the incoming request we append /GET.mock, /POST.mock, /DELETE.mock or /PUT.mock to the matched directory
   * Parse object also gives us access to a method getResponse which does the following tasks:
   *   - Read the response from the specified file
   *   - Run all the handlebars compilations as required.
   *   - Generate a HTTP Response
   *   - Send the response to client.
   * @returns {void}
   */
  private register = (): void => {
    this.app.get("*", (req: express.Request, res: express.Response) => {
      const parser = new HttpParser(req, res, this.mocksDir);
      const mockFile = parser.getMatchedDir() + "/GET.mock";
      parser.getResponse(mockFile);
    });
    this.app.post("*", (req: express.Request, res: express.Response) => {
      const parser = new HttpParser(req, res, this.mocksDir);
      const mockFile = parser.getMatchedDir() + "/POST.mock";
      parser.getResponse(mockFile);
    });
    this.app.put("*", (req: express.Request, res: express.Response) => {
      const parser = new HttpParser(req, res, this.mocksDir);
      const mockFile = parser.getMatchedDir() + "/PUT.mock";
      parser.getResponse(mockFile);
    });
    this.app.delete("*", (req: express.Request, res: express.Response) => {
      const parser = new HttpParser(req, res, this.mocksDir);
      const mockFile = parser.getMatchedDir() + "/DELETE.mock";
      parser.getResponse(mockFile);
    });
  };
}
