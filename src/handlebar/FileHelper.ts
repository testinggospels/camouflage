import logger from "../logger";
import path from "path";
/**
 * Defines and registers custom handlebar helper - file
 */
export class FileHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers file helper
   * - If file path is not included in the defined handlebar, log an error.
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("file", (context: any) => {
      if (typeof context.hash.path === "undefined") {
        logger.error("File path not specified.");
      } else {
        return `camouflage_file_helper=${path.resolve(context.hash.path)}`;
      }
    });
  };
}
