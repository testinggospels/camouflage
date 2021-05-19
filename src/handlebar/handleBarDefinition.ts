import Handlebars from "handlebars";
import moment from "moment";
import express from "express";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import jsonpath from "jsonpath";
import logger from "../logger";
import fs from "fs";
import path from "path";
/**
 * Defines and registers custom handlebar helpers now, randomValue, capture and num_between
 */
export class HandlerBarHelper {
  /**
   * Registers now helper
   * - If now helper is called without a format, set a default format as YYYY-MM-DD hh:mm:ss else use the format provided
   * - Set default offset to be used if offset is not specified. Default offset is 0s i.e. no offset
   * - If offset is defined the value will be stored in context.hash.offset, eg X days.
   * - Split value by a space, first element will be the amount of offset i.e. X, second element will be unit of offset, i.e. days
   * - Return a value with specified format and added offset
   * @returns {void}
   */
  nowHelper = () => {
    Handlebars.registerHelper("now", (context) => {
      const format = typeof context.hash.format === "undefined" ? "YYYY-MM-DD hh:mm:ss" : context.hash.format;
      let offsetUnit: moment.unitOfTime.DurationConstructor = "s";
      let offsetAmount: number = 0;
      if (typeof context.hash.offset !== "undefined") {
        let offset = context.hash.offset.split(" ");
        offsetAmount = <number>offset[0];
        offsetUnit = <moment.unitOfTime.DurationConstructor>offset[1];
      }
      switch (format) {
        case "epoch":
          return moment().add(offsetAmount, offsetUnit).format("x");
        case "unix":
          return moment().add(offsetAmount, offsetUnit).format("X");
        default:
          return moment().add(offsetAmount, offsetUnit).format(format);
      }
    });
  };
  /**
   * Registers randomValue helper
   * - If length of randomValue is not specified, set default length to 16
   * - If type of randomValue is not specified, set default type to ALPHANUMERIC
   * - If uppercase is specified, and is of ALPHABETICAL or ALPHANUMERIC type, add _UPPER to the type
   * - If type is UUID, return UUID, else generate a random value with specified type and length
   * @returns {void}
   */
  randomValueHelper = () => {
    Handlebars.registerHelper("randomValue", (context) => {
      let length = typeof context.hash.length === "undefined" ? 16 : context.hash.length;
      let type = typeof context.hash.type === "undefined" ? "ALPHANUMERIC" : context.hash.type;
      if (context.hash.uppercase && type.includes("ALPHA")) {
        type = type + "_UPPER";
      }
      if (type === "UUID") {
        return uuidv4();
      } else {
        return this.randomString(length, this.genCharArray(type));
      }
    });
  };
  /**
   * Registers capture helper
   * - Get the request object passed in from the context by calling template({request: req})
   * - Get the from value passed in while calling {{capture from=}}, accepted values query, headers, path, body
   * - For query and headers, key is required, else if not found a null/undefined value will be automatically returned.
   * - For path additional input regex is mandatory, if not passed return error
   * - For body additional inputs using and selector are mandatory, if not passed return error
   * @returns {void}
   */
  requestHelper = () => {
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
          return null;
      }
    });
  };
  /**
   * Registers num_between helper
   * - If lower or upper value is not passed, return 0
   * - If lower value is greater than upper value, log error and return 0
   * @returns {void}
   */
  numBetweenHelper = () => {
    Handlebars.registerHelper("num_between", (context) => {
      if (typeof context.hash.lower === "undefined" || typeof context.hash.upper === "undefined") {
        logger.error("lower or upper value not specified.");
        return 0;
      } else {
        const lower = parseInt(context.hash.lower);
        const upper = parseInt(context.hash.upper);
        if (lower > upper) {
          logger.error("lower value cannot be greater than upper value.");
          return 0;
        }
        const num = Math.floor(Math.random() * (upper - lower + 1) + lower);
        return num;
      }
    });
  };
  /**
   * Registers file helper
   * - If file path is not included in the defined handlebar, log an error.
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * @returns {void}
   */
  fileHelper = () => {
    Handlebars.registerHelper("file", (context) => {
      if (typeof context.hash.path === "undefined") {
        logger.error("File path not specified.");
      } else {
        if (fs.existsSync(path.resolve(context.hash.path))) {
          return `camouflage_file_helper=${path.resolve(context.hash.path)}`;
        }
      }
    });
  };
  /**
   * Registers code helper
   * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
   * @returns {void}
   */
  codeHelper = () => {
    Handlebars.registerHelper("code", (context) => {
      /* eslint-disable no-unused-vars */
      const request: express.Request = context.data.root.request;
      const logger = context.data.root.logger;
      /* eslint-disable no-unused-vars */
      const code = eval(context.fn(this));
      code["CamouflageResponseType"] = "code";
      return JSON.stringify(code);
    });
  };
  /**
   * Registers inject helper
   * - Define request and logger in the scope of the code helper context
   * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
   * @returns {void}
   */
  injectHelper = () => {
    Handlebars.registerHelper("inject", (context) => {
      const request: express.Request = context.data.root.request;
      const logger = context.data.root.logger;
      const result = eval(context.fn(this));
      return result;
    });
  };

  /**
   * Generates an random sequence of characters
   * @param {number} length - length of generated string
   * @param {string} chars - A sequence of valid characters for a specified type returned by genCharArray
   * @returns {string} A random sequence of characters of specified length
   */
  private randomString = (length: number, chars: string): string => {
    var result = "";
    if (typeof chars === "undefined") {
      this.randomFixedInteger(length);
    } else {
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };
  /**
   * Generates an random number of given length
   * @param {number} length - length of number of be generated
   * @returns {number} A number of specified length. i.e. 10 digit number: 2341912498
   */
  private randomFixedInteger = (length: number): number => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  };
  /**
   * Generates an string of characters to be used by randomString function for randomizing.
   * @param {string} type - Type of random value to be generated
   * @returns {string} A string of squence of valid characters according to type
   */
  private genCharArray = (type: string): string => {
    let alphabet;
    /**
     * Create a numbers array of [0...9]
     */
    let numbers = [...Array(10)].map((x, i) => i);
    switch (type) {
      case "ALPHANUMERIC":
        /**
         * If type is ALPHANUMERIC, return a string with characters [a-z][A-Z][0-9]
         * */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
        return alphabet.join("") + numbers.join("");
      case "ALPHANUMERIC_UPPER":
        /**
         * If type is ALPHANUMERIC_UPPER, return a string with characters [A-Z][0-9]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
        return alphabet.join("") + numbers.join("");
      case "ALPHABETIC":
        /**
         * If type is ALPHABETIC, return a string with characters [a-z][A-Z]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
        return alphabet.join("");
      case "ALPHABETIC_UPPER":
        /**
         * If type is ALPHABETIC_UPPER, return a string with characters [A-Z]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
        return alphabet.join("");
      case "NUMERIC":
        /**
         * If type is NUMERIC, return a string with characters [0-9]
         */
        return numbers.join("");
      default:
        break;
    }
  };
}
