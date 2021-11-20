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
        const lognormal = context.hash.lognormal;
        if (lower > upper) {
          logger.error("lower value cannot be greater than upper value.");
          return 0;
        }
        if (lognormal) {
          return randn_bm(lower, upper, 1)
        }
        const num = Math.floor(Math.random() * (upper - lower + 1) + lower);
        return num;
      }
    });
  };
}

function randn_bm(min: number, max: number, skew: number) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0)
    num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range

  else {
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}