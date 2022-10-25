import { Router, Request, Response } from "express";
import { Validation } from "../validation";
import { getLoaderInstance } from "../ConfigLoader";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { HttpParser } from "../parser/HttpParser";
import logger from "../logger";
/**
 * Defines and registers global contoller which will handle any request not handled by admin/management endpoints
 */
export default class GlobalController {
  private mocksDir: string;
  constructor() {
    const config: CamouflageConfig = getLoaderInstance().getConfig();
    this.mocksDir = config.protocols.http.mocks_dir;
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
  register = (): Router => {
    let router: Router = Router();
    router.all("*", (req: Request, res: Response) => {
      this.handler(req, res, req.method.toUpperCase());
    });
    // router.get("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "GET");
    // });
    // router.post("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "POST");
    // });
    // router.put("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "PUT");
    // });
    // router.delete("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "DELETE");
    // });
    // router.head("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "HEAD");
    // });
    // router.connect("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "CONNECT");
    // });
    // router.options("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "OPTIONS");
    // });
    // router.trace("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "TRACE");
    // });
    // router.patch("*", (req: Request, res: Response) => {
    //   this.handler(req, res, "PATCH");
    // });
    return router;
  };
  private handler = async (req: Request, res: Response, verb: string) => {
    const validator = Validation.getInstance();
    const request = validator.validateRequest(req);
    if (request.valid) {
      const parser = new HttpParser(req, res, this.mocksDir);
      const mockFile = parser.getMatchedDir() + `/${verb}.mock`;
      const response = await parser.getResponse(mockFile);
      if (!res.headersSent) {
        const responseValidation = validator.validateResponse(req, response);
        if (responseValidation.valid) {
          const { headers, status, body } = response;
          res.set(headers).status(status).send(body);
        } else {
          res.status(409).json(JSON.parse(responseValidation.error.message));
        }
      } else {
        logger.warn("Headers already sent.");
      }
    } else {
      res.status(400).json(JSON.parse(request.error.message));
    }
  };
}
