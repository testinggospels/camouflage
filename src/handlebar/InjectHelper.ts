import express from "express";
/**
 * Defines and registers custom handlebar helper - inject
 */
export class InjectHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers inject helper
   * - Define request and logger in the scope of the code helper context
   * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("inject", async (context: any) => {
      /* eslint-disable no-unused-vars */
      const request: express.Request = context.data.root.request;
      const logger = context.data.root.logger;
      /* eslint-disable no-unused-vars */
      const result = await eval(context.fn(this));
      return result;
    });
  };
}
