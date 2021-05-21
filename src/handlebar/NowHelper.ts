import Handlebars from "handlebars";
import logger from "../logger";
import moment from "moment";
/**
 * Defines and registers custom handlebar helper - now
 */
export class NowHelper {
  /**
   * Registers now helper
   * - If now helper is called without a format, set a default format as YYYY-MM-DD hh:mm:ss else use the format provided
   * - Set default offset to be used if offset is not specified. Default offset is 0s i.e. no offset
   * - If offset is defined the value will be stored in context.hash.offset, eg X days.
   * - Split value by a space, first element will be the amount of offset i.e. X, second element will be unit of offset, i.e. days
   * - Return a value with specified format and added offset
   * @returns {void}
   */
  register = () => {
    Handlebars.registerHelper("now", (context) => {
      const format = typeof context.hash.format === "undefined" ? "YYYY-MM-DD hh:mm:ss" : context.hash.format;
      let offsetUnit: moment.unitOfTime.DurationConstructor = "s";
      let offsetAmount: number = 0;
      if (typeof context.hash.offset !== "undefined") {
        let offset = context.hash.offset.split(" ");
        offsetAmount = <number>offset[0];
        offsetUnit = <moment.unitOfTime.DurationConstructor>offset[1];
      }
      switch (format) {
        case "epoch":
          return moment().add(offsetAmount, offsetUnit).format("x");
        case "unix":
          return moment().add(offsetAmount, offsetUnit).format("X");
        default:
          return moment().add(offsetAmount, offsetUnit).format(format);
      }
    });
  };
}
