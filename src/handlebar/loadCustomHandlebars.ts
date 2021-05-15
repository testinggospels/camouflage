import Handlebars from "handlebars";
import fs from "fs";
import logger from "../logger";
import express from "express";
import path from "path";
const existingHandlebars = ["now", "randomValue", "capture", "num_between", "file", "code", "inject"];

const registerCustomHandlebars = (extHelpers: string) => {
  if (fs.existsSync(path.resolve(extHelpers))) {
    logger.info(`Loading custom handlebar helpers from ${extHelpers}`);
    const customHandleBarDefinition = fs.readFileSync(path.resolve(extHelpers)).toString();
    const customHandlebars: CustomHandlebars[] = JSON.parse(customHandleBarDefinition);
    customHandlebars.forEach((customHandlebar) => {
      if (customHandlebar.name in existingHandlebars) {
        logger.error(`Cannot override custom helper ${customHandlebar.name}`);
      } else {
        logger.info(`Registering custom handlebars: ${customHandlebar.name}`);
        Handlebars.registerHelper(customHandlebar.name, (context) => {
          const request: express.Request = context.data.root.request;
          const result = eval(customHandlebar.logic);
          return result;
        });
      }
    });
  } else {
    logger.error(`Loading custom handlebar helpers from ${extHelpers} failed. File not found.`);
  }
};

interface CustomHandlebars {
  name: string;
  logic: string;
}

export default registerCustomHandlebars;
