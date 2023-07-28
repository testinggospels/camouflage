import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { getHandlebars } from "../handlebar";
import logger from "../logger";
import { ProxyResponse } from "../handlebar/ProxyHelper";
import * as httpProxy from "http-proxy";
import { sleep } from "../sleep";

const proxy = httpProxy.createProxyServer({});
let DELAY = 0;
const Handlebars = getHandlebars();
/**
 * Create a parser class which defines methods to parse
 * 1. Request URL to get a matching directory
 * 2. From matched directory get .mock file content and generate a response
 */

export interface HttpParserResponse {
  status: number;
  body: string;
  headers: { [key: string]: string };
}
export class HttpParser {
  private req: express.Request;
  private mockDir: string;
  private res: express.Response;
  /**
   *
   * @param {express.Request} req Express Request object for current instance of incoming request
   * @param {express.Response} res Express response to be sent to client
   * @param {string} mockDir location of http mocks
   */
  constructor(req: express.Request, res: express.Response, mockDir: string) {
    this.req = req;
    this.mockDir = mockDir;
    this.res = res;
  }
  /**
   * Finds a closest match dir for an incoming request
   * @returns {string} matchedDir for a given incoming request
   */
  getMatchedDir = (): string => {
    const reqDetails = {
      method: this.req.method.toUpperCase(),
      path: this.req.path,
      protocol: this.req.protocol,
      httpVersion: this.req.httpVersion,
      query: this.req.query,
      headers: this.req.headers,
      body: this.req.body,
    };
    const matchedDir = getWildcardPath(reqDetails.path, this.mockDir);
    return matchedDir;
  };
  /**
   * Defines a default response, if the closest matchedDir is present, parses and sends the response from mockfile,
   * Looks for API Level, and Global level default response overrides if mockfile is not found.
   * If no default response overrides are found, send the defined default response
   * @param {string} mockFile location of of the closest mached mockfile for incoming request
   * @returns {string} matchedDir for a given incoming request
   */
  getResponse = async (mockFile: string): Promise<HttpParserResponse> => {
    // Default response
    let response: HttpParserResponse = {
      status: 404,
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
    };
    // Check if mock file exists
    if (fs.existsSync(mockFile)) {
      response = await this.prepareResponse(mockFile);
    } else {
      logger.error(`No suitable mock file found: ${mockFile}`);
      if (fs.existsSync(path.join(this.mockDir, "__", "GET.mock"))) {
        logger.debug(
          `Found a custom global override for default response. Sending custom default response.`
        );
        response = await this.prepareResponse(
          path.join(this.mockDir, "__", "GET.mock")
        );
      } else {
        //If no mockFile is found, return default response
        logger.debug(
          `No custom global override for default response. Sending default Camouflage response.`
        );
      }
    }

    response.status = parseFloat((<unknown>response.status) as string);
    DELAY = 0;
    return response;
  };
  /**
   * - Since response file contains headers and body both, a PARSE_BODY flag is required to tell the logic if it's currently parsing headers or body
   * - Set responseBody to an empty string and set a default response object
   * - Set default response
   * - Compile the handlebars used in the contents of mockFile
   * - Generate actual response i.e. replace handlebars with their actual values and split the content into lines
   * - If the mockfile contains the delimiter ====, split the content using the delimiter and pick one of the responses at random
   * - Split file contents by os.EOL and read file line by line
   * - Set PARSE_BODY flag to try when reader finds a blank line, since according to standard format of a raw HTTP Response, headers and body are separated by a blank line.
   * - If line includes HTTP/HTTPS i.e. first line. Get the response status code
   * - If following conditions are met:
   *   - Line is not blank; and
   *   - Parser is not currently parsing response body yet i.e. PARSE_BODY === false
   * - Then:
   *   - Split line by :, of which first part will be header key and 2nd part will be header value
   *   - If headerKey is response delay, set variable DELAY to headerValue
   * - If parsing response body, i.e. PARSE_BODY === true. Concatenate every line till last line to a responseBody variable
   * - If on last line of response, do following:
   *   - Trim and remove whitespaces from the responseBody
   *   - Compile the Handlebars to generate a final response
   *   - Set PARSE_BODY flag back to false and responseBody to blank
   *   - Set express.Response Status code to response.status
   *   - Send the generated Response, from a timeout set to send the response after a DELAY value
   * @param {string} mockFile location of of the closest mached mockfile for incoming request
   */
  private prepareResponse = async (
    mockFile: string
  ): Promise<HttpParserResponse> => {
    let PARSE_BODY = false;
    let responseBody = "";
    const response: HttpParserResponse = {
      status: 404,
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
    };
    const template = Handlebars.compile(fs.readFileSync(mockFile).toString());
    let fileResponse = await template({ request: this.req, logger: logger });
    if (fileResponse.includes("====")) {
      const fileContentArray = removeBlanks(fileResponse.split("===="));
      fileResponse =
        fileContentArray[Math.floor(Math.random() * fileContentArray.length)];
    }
    const newLine = getNewLine(fileResponse);
    const fileContent = fileResponse.trim().split(newLine);
    for (let index = 0; index < fileContent.length; index++) {
      const line = fileContent[index];

      if (line === "") {
        PARSE_BODY = true;
      }
      if (line.includes("HTTP")) {
        const regex = /(?<=HTTP\/\d).*?\s+(\d{3,3})/i;
        if (!regex.test(line)) {
          logger.error("Response code should be valid string");
          throw new Error("Response code should be valid string");
        }
        response.status = <number>(<unknown>line.match(regex)[1]);
        logger.debug("Response Status set to " + response.status);
      } else {
        if (line !== "" && !PARSE_BODY) {
          const headerKey = line.split(":")[0];
          const headerValue = line.split(":").slice(1).join(":");
          if (headerKey === "Response-Delay") {
            DELAY = <number>(<unknown>headerValue);
            logger.debug(`Delay Set ${headerValue}`);
          } else {
            this.res.setHeader(headerKey, headerValue);
            response.headers[headerKey] = headerValue;
            logger.debug(`Headers Set ${headerKey}: ${headerValue}`);
          }
        }
      }
      if (PARSE_BODY) {
        responseBody = responseBody + "<br/>" + line;
      }
      if (index == fileContent.length - 1) {
        if (responseBody.includes("camouflage_file_helper")) {
          const fileResponse = responseBody.split(";")[1];
          if (!fs.existsSync(fileResponse)) this.res.status(404);
          await sleep(DELAY);
          this.res.sendFile(fileResponse);
        } else {
          responseBody = responseBody.replace(/\s+/g, " ").trim();
          responseBody = responseBody.replace(/{{{/, "{ {{");
          responseBody = responseBody.replace(/}}}/, "}} }");
          const template = Handlebars.compile(responseBody);
          try {
            const codeResponse = JSON.parse(
              responseBody.replace(/&quot;/g, '"')
            );
            switch (codeResponse["CamouflageResponseType"]) {
              case "code":
                response.status = codeResponse["status"];
                if (codeResponse["headers"]) {
                  response.headers = {
                    ...response.headers,
                    ...codeResponse["headers"],
                  };
                }
                await sleep(DELAY);
                logger.debug(`Generated Response ${codeResponse["body"]}`);
                response.body = codeResponse["body"];
                return response;
                break;
              case "proxy":
                /* eslint-disable no-case-declarations */
                const proxyResponse: ProxyResponse = JSON.parse(responseBody);
                /* eslint-disable no-case-declarations */
                proxy.web(this.req, this.res, proxyResponse.options);
                break;
              case "fault":
                const faultType = codeResponse["FaultType"];
                switch (faultType) {
                  case "ERR_EMPTY_RESPONSE":
                    this.res.socket.destroy();
                    break;
                  case "ERR_INCOMPLETE_CHUNKED_ENCODING":
                    this.res.writeHead(200);
                    this.res.write("123sdlyndb;aie10-)(&2*2++1dnb/vlaj");
                    setTimeout(() => {
                      this.res.socket.destroy();
                    }, 100);
                    break;
                  case "ERR_CONTENT_LENGTH_MISMATCH":
                    this.res.setHeader("Content-Length", 100);
                    this.res.writeHead(200);
                    this.res.write("123sdlyndb;aie10-)(&2*2++1dnb/vlaj");
                    setTimeout(() => {
                      this.res.socket.destroy();
                    }, 100);
                    break;
                  default:
                    break;
                }
                break;
              default:
                await sleep(DELAY);
                logger.debug(
                  `Generated Response ${await template({
                    request: this.req,
                    logger: logger,
                  })}`
                );

                response.body = await template({
                  request: this.req,
                  logger: logger,
                });
                response.body = response.body.split("<br />").join("\n").trim()
                return response;
                break;
            }
          } catch (error) {
            logger.warn(error.message);
            await sleep(DELAY);
            logger.debug(
              `Generated Response ${await template({
                request: this.req,
                logger: logger,
              })}`
            );
            response.body = await template({
              request: this.req,
              logger: logger,
            });
            response.body = response.body.split("<br/>").join("\n").trim()
            return response;
          }
          response.body = responseBody;
        }
        PARSE_BODY = false;
        responseBody = "";
      }
    }
    return response;
  };
}

const removeBlanks = (array: Array<any>) => {
  return array.filter(function (i) {
    return i;
  });
};
const getWildcardPath = (dir: string, mockDir: string) => {
  const steps = removeBlanks(dir.split("/"));
  let testPath;
  let newPath = path.resolve(mockDir);
  while (steps.length) {
    const next = steps.shift();
    testPath = path.join(newPath, next);
    if (fs.existsSync(testPath)) {
      newPath = testPath;
      testPath = path.join(newPath, next);
    } else {
      testPath = path.join(newPath, "__");
      if (fs.existsSync(testPath)) {
        newPath = testPath;
        continue;
      } else {
        newPath = testPath;
        break;
      }
    }
  }
  return newPath;
};
const getNewLine = (source: string) => {
  const cr = source.split("\r").length;
  const lf = source.split("\n").length;
  const crlf = source.split("\r\n").length;

  if (cr + lf === 0) {
    logger.warn(
      `No valid new line found in the mock file. Using OS default: ${os.EOL}`
    );
    return os.EOL;
  }

  if (crlf === cr && crlf === lf) {
    logger.debug("Using new line as \\r\\n");
    return "\r\n";
  }

  if (cr > lf) {
    logger.debug("Using new line as \\r");
    return "\r";
  } else {
    logger.debug("Using new line as \\n");
    return "\n";
  }
};
