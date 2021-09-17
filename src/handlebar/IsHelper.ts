import Handlebars from "handlebars";
import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - is
 */
export class IsHelper {
    /**
     * Registers is helper
     * - Helps in comparision of two values
     * - Expects two values, i.e. value1 and value2
     * @returns {void}
     */
    register = () => {
        Handlebars.registerHelper("is", (context) => {
            logger.debug(JSON.stringify((context.hash)));
            if (typeof context.hash.value1 === "undefined" || typeof context.hash.value2 === "undefined") {
                logger.error("Two values are required for comparision.");
                return "N/A";
            } else {
                if (context.hash.value1 === context.hash.value2) {
                    return context.fn(this);
                } else {
                    return context.inverse(this);
                }
            }
        });
    };
}
