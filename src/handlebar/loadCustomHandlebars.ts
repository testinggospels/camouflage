import fs from "fs";
import logger from "../logger";
import express from "express";
import path from "path";
const existingHandlebars = ["now", "randomValue", "capture", "num_between", "file", "code", "inject"];
/**
 * - If file exists read file and parse it to a JSONObject of type CustomHandleBar
 * - For each custom handlebar, check if the name equals any of the inbuilt handlebars
 * - If not, register helpers by their name and executing the IIFE code provided under logic
 * - Create request and logger objects under the scope of each custom handlebar
 * @param {string} extHelpers location of the external handlebars json file
 */
const registerCustomHandlebars = (Handlebars: any, extHelpers: string) => {
  if (fs.existsSync(path.resolve(extHelpers))) {
    logger.info(`Loading custom handlebar helpers from ${extHelpers}`);
    const customHandleBarDefinition = fs.readFileSync(path.resolve(extHelpers)).toString();
    const customHandlebars: CustomHandlebar[] = JSON.parse(customHandleBarDefinition);
    customHandlebars.forEach((customHandlebar) => {
      if (customHandlebar.name in existingHandlebars) {
        logger.error(`Cannot override custom helper ${customHandlebar.name}`);
      } else {
        logger.info(`Registering custom handlebars: ${customHandlebar.name}`);
        Handlebars.registerHelper(customHandlebar.name, (context: any) => {
          /* eslint-disable no-unused-vars */
          const request: express.Request = context.data.root.request;
          const logger = context.data.root.logger;
          /* eslint-disable no-unused-vars */
          const result = eval(customHandlebar.logic);
          return result;
        });
      }
    });
  } else {
    logger.error(`Loading custom handlebar helpers from ${extHelpers} failed. File not found.`);
  }
};

interface CustomHandlebar {
  /**
   * name of the custom helper
   */
  name: string;
  /**
   * logic of the custom helper
   */
  logic: string;
}

export default registerCustomHandlebars;
