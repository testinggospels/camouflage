import logger from "../logger";
import fs from "fs";
import path from "path";
/**
 * Defines and registers custom handlebar helper - proxy
 */
export class ProxyHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers proxy helper
   * - If file path is not included in the defined handlebar, log an error.
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("proxy", (context: any) => {
      const options = JSON.parse(context.fn(this));
      if (options.ssl && options.ssl.key && fs.existsSync(path.resolve(options.ssl.key))) {
        options.ssl.key = fs.readFileSync(path.resolve(options.ssl.key))
      }
      if (options.ssl && options.ssl.cert && fs.existsSync(path.resolve(options.ssl.cert))) {
        options.ssl.cert = fs.readFileSync(path.resolve(options.ssl.cert))
      }
      if (options.target.pfx && fs.existsSync(path.resolve(options.target.pfx))) {
        options.target.pfx = fs.readFileSync(path.resolve(options.target.pfx))
      }
      const proxyResponse: ProxyResponse = {
        CamouflageResponseType: "proxy",
        options: options,
      };
      return JSON.stringify(proxyResponse);
    });
  };
}

export interface ProxyResponse {
  CamouflageResponseType: string;
  options: Record<string, any>;
}
