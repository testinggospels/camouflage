import express from "express";
import Handlebars from "handlebars";
import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - inject
 */
export class InjectHelper {
  /**
   * Registers inject helper
   * - Define request and logger in the scope of the code helper context
   * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
   * @returns {void}
   */
  register = () => {
    Handlebars.registerHelper("inject", (context) => {
      /* eslint-disable no-unused-vars */
      const request: express.Request = context.data.root.request;
      const logger = context.data.root.logger;
      /* eslint-disable no-unused-vars */
      const result = eval(context.fn(this));
      return result;
    });
  };
}
