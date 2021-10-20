import logger from "../logger";
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
      const proxyResponse: ProxyResponse = {
        CamouflageResponseType: "proxy",
        data: <ProxyOptions>JSON.parse(context.fn(this)),
      };
      return JSON.stringify(proxyResponse);
    });
  };
}

export interface ProxyResponse {
  CamouflageResponseType: string;
  data: ProxyOptions;
}

interface ProxyOptions {
  target: string;
}
