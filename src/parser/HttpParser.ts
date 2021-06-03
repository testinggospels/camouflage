import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import Handlebars from "handlebars";
import logger from "../logger";
import { ProxyResponse } from "../handlebar/ProxyHelper";
// @ts-ignore
import * as httpProxy from "http-proxy";
const proxy = httpProxy.createProxyServer({});
let DELAY: number = 0;
/**
 * Create a parser class which defines methods to parse
 * 1. Request URL to get a matching directory
 * 2. From matched directory get .mock file content and generate a response
 */
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
  getResponse = (mockFile: string) => {
    // Default response
    let response = {
      status: 404,
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
    };
    // Check if mock file exists
    if (fs.existsSync(mockFile)) {
      this.prepareResponse(mockFile);
    } else {
      logger.error(`No suitable mock file found: ${mockFile}`);
      if (fs.existsSync(path.join(this.mockDir, "__", "GET.mock"))) {
        logger.debug(`Found a custom global override for default response. Sending custom default response.`);
        this.prepareResponse(path.join(this.mockDir, "__", "GET.mock"));
      } else {
        //If no mockFile is found, return default response
        logger.debug(`No custom global override for default response. Sending default Camouflage response.`);
        this.res.statusCode = response.status;
        let headerKeys = Object.keys(response.headers);
        headerKeys.forEach((headerKey) => {
          // @ts-ignore
          res.setHeader(headerKey, response.headers[headerKey]);
        });
        this.res.send(response.body);
      }
    }
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
  private prepareResponse = (mockFile: string) => {
    let PARSE_BODY = false;
    let responseBody = "";
    let response = {
      status: 404,
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
    };
    const template = Handlebars.compile(fs.readFileSync(mockFile).toString());
    let fileResponse = template({ request: this.req, logger: logger });
    if (fileResponse.includes("====")) {
      const fileContentArray = removeBlanks(fileResponse.split("===="));
      fileResponse = fileContentArray[Math.floor(Math.random() * fileContentArray.length)];
    }
    const fileContent = fileResponse.trim().split(os.EOL);
    fileContent.forEach((line, index) => {
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
          let headerKey = line.split(":")[0];
          let headerValue = line.split(":")[1];
          if (headerKey === "Response-Delay") {
            DELAY = <number>(<unknown>headerValue);
            logger.debug(`Delay Set ${headerValue}`);
          } else {
            this.res.setHeader(headerKey, headerValue);
            logger.debug(`Headers Set ${headerKey}: ${headerValue}`);
          }
        }
      }
      if (PARSE_BODY) {
        responseBody = responseBody + line;
      }
      if (index == fileContent.length - 1) {
        this.res.statusCode = response.status;
        if (responseBody.includes("camouflage_file_helper")) {
          const fileResponse = responseBody.split(";")[1];
          setTimeout(() => {
            this.res.sendFile(fileResponse);
          }, DELAY);
        } else {
          responseBody = responseBody.replace(/\s+/g, " ").trim();
          responseBody = responseBody.replace(/{{{/, "{ {{");
          responseBody = responseBody.replace(/}}}/, "}} }");
          const template = Handlebars.compile(responseBody);
          try {
            const codeResponse = JSON.parse(responseBody);
            switch (codeResponse["CamouflageResponseType"]) {
              case "code":
                this.res.statusCode = codeResponse["status"] || this.res.statusCode;
                if (codeResponse["headers"]) {
                  Object.keys(codeResponse["headers"]).forEach((header) => {
                    this.res.setHeader(header, codeResponse["headers"][header]);
                  });
                }
                setTimeout(() => {
                  logger.debug(`Generated Response ${codeResponse["body"]}`);
                  this.res.send(codeResponse["body"]);
                });
                break;
              case "proxy":
                let proxyResponse: ProxyResponse = JSON.parse(responseBody);
                let target = proxyResponse.data.target;
                console.log(target);
                proxy.web(this.req, this.res, { target: target });
                break;
              default:
                setTimeout(() => {
                  logger.debug(`Generated Response ${template({ request: this.req, logger: logger })}`);
                  this.res.send(template({ request: this.req, logger: logger }));
                }, DELAY);
                break;
            }
          } catch (error) {
            logger.warn(error.message);
            setTimeout(() => {
              logger.debug(`Generated Response ${template({ request: this.req, logger: logger })}`);
              this.res.send(template({ request: this.req, logger: logger }));
            }, DELAY);
          }
        }
        PARSE_BODY = false;
        responseBody = "";
        DELAY = 0;
      }
    });
  };
}

const removeBlanks = (array: Array<any>) => {
  return array.filter(function (i) {
    return i;
  });
};
const getWildcardPath = (dir: string, mockDir: string) => {
  let steps = removeBlanks(dir.split("/"));
  let testPath;
  let newPath = path.resolve(mockDir);
  while (steps.length) {
    let next = steps.shift();
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
