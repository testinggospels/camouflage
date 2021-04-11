import fs from "fs";
// @ts-ignore
import lineReader from "line-reader";
import express from "express";
import Handlebars from "handlebars";

export default function getResponse(mockFile: string, req: express.Request, res: express.Response) {
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
    //Read file line by line
    lineReader.eachLine(mockFile, (line: any, last: boolean) => {
      //Set PARSE_BODY flag to try when reader finds a blank line
      if (line === "") {
        PARSE_BODY = true;
      }
      //If line includes HTTP/HTTPS i.e. first line. Get the response status code
      if (line.includes("HTTP")) {
        const regex = /(?<=HTTP\/\d.\d\s{1,1})(\d{3,3})(?=[a-z0-9\s]+)/gi;
        if (!regex.test(line)) throw new Error("Response code should be valid string");
        response.status = line.match(regex).join("");
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
          res.setHeader(headerKey, headerValue);
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
      if (last) {
        responseBody = responseBody.replace(/\s+/g, " ").trim();
        responseBody = responseBody.replace(/{{{/, "{ {{");
        responseBody = responseBody.replace(/}}}/, "}} }");
        const template = Handlebars.compile(responseBody);
        PARSE_BODY = false;
        responseBody = "";
        res.statusCode = response.status;
        res.send(template({ request: req }));
      }
    });
  } else {
    //If no mockFile is found, return default response
    res.statusCode = response.status;
    let headerKeys = Object.keys(response.headers);
    headerKeys.forEach((headerKey) => {
      // @ts-ignore
      res.setHeader(headerKey, response.headers[headerKey]);
    });
    res.send(response.body);
  }
}
