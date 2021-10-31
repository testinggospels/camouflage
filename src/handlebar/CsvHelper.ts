import logger from "../logger";
import path from "path";
import fs from "fs";
import express from "express";
import * as csv from 'convert-csv-to-json';
/**
 * Defines and registers custom handlebar helper - csv
 */
export class CsvHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers csv helper
   * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
   * - Fetch the file path, key, value and random variables from the the helper
   * - Throw error if file path not defined log and return appropriate error
   * - if random is true, evaluate response for one random row from csv file
   * - else, evaluate response for all rows from csv file matching a search pattern using specified key and value
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("csv", (context: any) => {
      /* eslint-disable no-unused-vars */
      const request: express.Request = context.data.root.request;
      /* eslint-disable no-unused-vars */
      const src = context.hash.src;
      const key = context.hash.key;
      const value = context.hash.value;
      const random = context.hash.random;
      if (typeof src === "undefined") {
        logger.error("'src' is a required parameter and has not been set.");
        return "'src' is a required parameter and has not been set.";
      } else {
        const file = path.resolve(src);
        if (fs.existsSync(file)) {
          const jsonArr = csv.getJsonFromCsv(file);
          /* eslint-disable no-unused-vars */
          let result = {};
          /* eslint-disable no-unused-vars */
          if (random) {
            result = jsonArr[Math.floor(Math.random() * jsonArr.length)];
          } else {
            if (typeof key === "undefined" || typeof value === "undefined") {
              logger.error("If random is false, 'key' & 'value' are required parameters");
              return "If random is false, 'key' & 'value' are required parameters";
            }
            result = jsonArr.filter((jsonObj: any) => {
              return jsonObj[key] === value;
            });
          }
          const output = eval(context.fn(this)).trim();
          return output;
        } else {
          logger.error("CSV file not found");
          return "CSV file not found";
        }
      }
    });
  };
}
