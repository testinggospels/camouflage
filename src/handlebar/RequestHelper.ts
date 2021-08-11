import Handlebars from "handlebars";
import logger from "../logger";
import express from "express";
// @ts-ignore
import jsonpath from "jsonpath";

/**
 * Defines and registers custom handlebar helper - csv
 */
export class RequestHelper {
  /**
   * Registers capture helper
   * - Get the request object passed in from the context by calling template({request: req})
   * - Get the from value passed in while calling {{capture from=}}, accepted values query, headers, path, body
   * - For query and headers, key is required, else if not found a null/undefined value will be automatically returned.
   * - For path additional input regex is mandatory, if not passed return error
   * - For body additional inputs using and selector are mandatory, if not passed return error
   * @returns {void}
   */
  register = () => {
    Handlebars.registerHelper("capture", (context) => {
      const request: express.Request = context.data.root.request;
      const from: string = context.hash.from;
      switch (from) {
        case "query":
          return request.query[context.hash.key];
        case "headers":
          return request.headers[context.hash.key];
        case "path":
          if (typeof context.hash.regex === "undefined") {
            logger.debug("ERROR: No regex specified");
            return "Please specify a regex with path";
          } else {
            let regex = new RegExp(context.hash.regex);
            if (regex.test(request.path)) {
              return regex.exec(request.path)[1];
            } else {
              logger.debug(`ERROR: No match found for specified regex ${context.hash.regex}`);
              return "No match found.";
            }
          }
        case "body":
          if (typeof context.hash.using === "undefined" || typeof context.hash.selector == "undefined") {
            logger.debug("ERROR: No selector or using values specified");
            return "Please specify using and selector fields.";
          } else {
            switch (context.hash.using) {
              case "regex": {
                let regex = new RegExp(context.hash.selector);
                let body = JSON.stringify(request.body, null, 2);
                if (regex.test(body)) {
                  return regex.exec(body)[1];
                } else {
                  logger.debug(`ERROR: No match found for specified regex ${context.hash.selector}`);
                  return "No match found.";
                }
              }
              case "jsonpath": {
                try {
                  return jsonpath.query(request.body, context.hash.selector);
                } catch (err) {
                  logger.debug(`ERROR: No match found for specified jsonpath ${context.hash.selector}`);
                  logger.error(`ERROR: ${err}`);
                  return "some error occuered";
                }
              }
              default:
                return null;
            }
          }
        default:
          if (typeof context.hash.using === "undefined" || typeof context.hash.selector == "undefined") {
            logger.debug("ERROR: No selector or using values specified");
            return "Please specify using and selector fields.";
          } else {
            switch (context.hash.using) {
              case "regex": {
                let regex = new RegExp(context.hash.selector);
                let body = JSON.stringify(context.data.root.request, null, 2);
                if (regex.test(body)) {
                  return regex.exec(body)[1];
                } else {
                  logger.debug(`ERROR: No match found for specified regex ${context.hash.selector}`);
                  return "No match found.";
                }
              }
              case "jsonpath": {
                try {
                  return jsonpath.query(context.data.root.request, context.hash.selector);
                } catch (err) {
                  logger.debug(`ERROR: No match found for specified jsonpath ${context.hash.selector}`);
                  logger.error(`ERROR: ${err}`);
                  return "some error occuered";
                }
              }
              default:
                return null;
            }
          }
      }
    });
  };
}
