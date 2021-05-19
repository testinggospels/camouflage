import Handlebars from "handlebars";
import logger from "../logger";
import path from "path";
const csv = require("convert-csv-to-json");

export class CsvHelper {
  csvHelper = () => {
    Handlebars.registerHelper("csv", (context) => {
      const src = context.hash.src;
      const key = context.hash.key;
      const value = context.hash.value;
      const random = context.hash.random;
      if (typeof src === "undefined") {
        logger.error("'src' is a required parameter and has not been set.");
        return "'src' is a required parameter and has not been set.";
      } else {
        const file = path.resolve(src);
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
      }
    });
  };
}
