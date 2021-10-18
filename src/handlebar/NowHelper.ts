import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - num_between
 */
export class NumBetweenHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers num_between helper
   * - If lower or upper value is not passed, return 0
   * - If lower value is greater than upper value, log error and return 0
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("num_between", (context: any) => {
      if (typeof context.hash.lower === "undefined" || typeof context.hash.upper === "undefined") {
        logger.error("lower or upper value not specified.");
        return 0;
      } else {
        const lower = parseInt(context.hash.lower);
        const upper = parseInt(context.hash.upper);
        if (lower > upper) {
          logger.error("lower value cannot be greater than upper value.");
          return 0;
        }
        const num = Math.floor(Math.random() * (upper - lower + 1) + lower);
        return num;
      }
    });
  };
}
