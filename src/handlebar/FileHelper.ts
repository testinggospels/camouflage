import Handlebars from "handlebars";
import logger from "../logger";
import fs from "fs";
import path from "path";
/**
 * Defines and registers custom handlebar helper - file
 */
export class FileHelper {
  /**
   * Registers file helper
   * - If file path is not included in the defined handlebar, log an error.
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * @returns {void}
   */
  register = () => {
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
}
