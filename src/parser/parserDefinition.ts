import express from "express";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
let DELAY: number = 0;

export class Parser {
  private req: express.Request;
  private mockDir: string;
  private res: express.Response;
  constructor(req: express.Request, res: express.Response, mockDir: string) {
    this.req = req;
    this.mockDir = mockDir;
    this.res = res;
  }
  getMatchedDir = () => {
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

  getResponse = (mockFile: string) => {
    let PARSE_BODY = false;
    let responseBody = "";
    let response = {
      status: 404,
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
    };
    // Check if file exists
    if (fs.existsSync(mockFile)) {
      const template = Handlebars.compile(fs.readFileSync(mockFile).toString());
      let fileContent = os.platform() === "win32" ? template({ request: this.req }).split("\r\n") : template({ request: this.req }).split("\n");
      //Read file line by line
      fileContent.forEach((line, index) => {
        //Set PARSE_BODY flag to try when reader finds a blank line
        if (line === "") {
          PARSE_BODY = true;
        }
        //If line includes HTTP/HTTPS i.e. first line. Get the response status code
        if (line.includes("HTTP")) {
          const regex = /(?<=HTTP\/\d.\d\s{1,1})(\d{3,3})(?=[a-z0-9\s]+)/gi;
          if (!regex.test(line)) throw new Error("Response code should be valid string");
          response.status = <number>(<unknown>line.match(regex).join(""));
        } else {
          /**
           * If following conditions are met:
           *      Line is not blank
           *      And read is not parsing response body yet
           * Then:
           *      Split line by :, of which first part will be header key and 2nd part will be header value
           */
          if (line !== "" && !PARSE_BODY) {
            let headerKey = line.split(":")[0];
            let headerValue = line.split(":")[1];
            if (headerKey === "Response-Delay") {
              DELAY = <number>(<unknown>headerValue);
            } else {
              this.res.setHeader(headerKey, headerValue);
            }
          }
        }
        // If parsing response body. Concatenate every line till last line to a responseBody variable
        if (PARSE_BODY) {
          responseBody = responseBody + line;
        }
        /**
         * If on last line, do following:
         *    Trim and remove whitespaces from the responseBody
         *    Compile the Handlebars to generate a final response
         *    Set PARSE_BODY flag back to false and responseBody to blank
         *    Set express.Response Status code to response.status
         *    Send the generated Response
         */
        if (index == fileContent.length - 1) {
          responseBody = responseBody.replace(/\s+/g, " ").trim();
          responseBody = responseBody.replace(/{{{/, "{ {{");
          responseBody = responseBody.replace(/}}}/, "}} }");
          const template = Handlebars.compile(responseBody);
          PARSE_BODY = false;
          responseBody = "";
          this.res.statusCode = response.status;
          setTimeout(() => {
            this.res.send(template({ request: this.req }));
          }, DELAY);
          DELAY = 0;
        }
      });
    } else {
      //If no mockFile is found, return default response
      this.res.statusCode = response.status;
      let headerKeys = Object.keys(response.headers);
      headerKeys.forEach((headerKey) => {
        // @ts-ignore
        res.setHeader(headerKey, response.headers[headerKey]);
      });
      this.res.send(response.body);
    }
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
  let newPath = path.join(mockDir, steps.join("/"));
  let exists = false;

  while (steps.length) {
    steps.pop();
    testPath = path.join(mockDir, steps.join("/"), "__");
    exists = fs.existsSync(testPath);
    if (exists) {
      newPath = testPath;
      break;
    }
  }
  return newPath;
};
