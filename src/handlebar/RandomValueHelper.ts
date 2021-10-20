import logger from "../logger";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
/**
 * Defines and registers custom handlebar helper - randomValue
 */
export class RandomValueHelper {
  private Handlebars: any;
  constructor(Handlebars: any) {
    this.Handlebars = Handlebars
  }
  /**
   * Registers csv helper
   * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
   * - Fetch the file path, key, value and random variables from the the helper
   * - Throw error if file path not defined log and return appropriate error
   * - if random is true, evaluate response for one random row from csv file
   * - else, evaluate response for all rows from csv file matching a search pattern using specified key and value
   * @returns {void}
   */
  /**
   * Registers randomValue helper
   * - If length of randomValue is not specified, set default length to 16
   * - If type of randomValue is not specified, set default type to ALPHANUMERIC
   * - If uppercase is specified, and is of ALPHABETICAL or ALPHANUMERIC type, add _UPPER to the type
   * - If type is UUID, return UUID, else generate a random value with specified type and length
   * @returns {void}
   */
  register = () => {
    this.Handlebars.registerHelper("randomValue", (context: any) => {
      const length = typeof context.hash.length === "undefined" ? 16 : context.hash.length;
      let type = typeof context.hash.type === "undefined" ? "ALPHANUMERIC" : context.hash.type;
      if (context.hash.uppercase && type.includes("ALPHA")) {
        type = type + "_UPPER";
      }
      if (type === "UUID") {
        return uuidv4();
      } else {
        return this.randomString(length, this.genCharArray(type));
      }
    });
  };

  /**
   * Generates an random sequence of characters
   * @param {number} length - length of generated string
   * @param {string} chars - A sequence of valid characters for a specified type returned by genCharArray
   * @returns {string} A random sequence of characters of specified length
   */
  private randomString = (length: number, chars: string): string => {
    let result = "";
    if (typeof chars === "undefined") {
      this.randomFixedInteger(length);
    } else {
      for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };
  /**
   * Generates an random number of given length
   * @param {number} length - length of number of be generated
   * @returns {number} A number of specified length. i.e. 10 digit number: 2341912498
   */
  private randomFixedInteger = (length: number): number => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  };
  /**
   * Generates an string of characters to be used by randomString function for randomizing.
   * @param {string} type - Type of random value to be generated
   * @returns {string} A string of squence of valid characters according to type
   */
  private genCharArray = (type: string): string => {
    let alphabet;
    /**
     * Create a numbers array of [0...9]
     */
    const numbers = [...Array(10)].map((x, i) => i);
    switch (type) {
      case "ALPHANUMERIC":
        /**
         * If type is ALPHANUMERIC, return a string with characters [a-z][A-Z][0-9]
         * */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
        return alphabet.join("") + numbers.join("");
      case "ALPHANUMERIC_UPPER":
        /**
         * If type is ALPHANUMERIC_UPPER, return a string with characters [A-Z][0-9]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
        return alphabet.join("") + numbers.join("");
      case "ALPHABETIC":
        /**
         * If type is ALPHABETIC, return a string with characters [a-z][A-Z]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
        return alphabet.join("");
      case "ALPHABETIC_UPPER":
        /**
         * If type is ALPHABETIC_UPPER, return a string with characters [A-Z]
         */
        alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
        return alphabet.join("");
      case "NUMERIC":
        /**
         * If type is NUMERIC, return a string with characters [0-9]
         */
        return numbers.join("");
      default:
        break;
    }
  };
}
