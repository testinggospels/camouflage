import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - assign
 */
export class AssignHelper {
    private Handlebars: any;
    constructor(Handlebars: any) {
        this.Handlebars = Handlebars
    }
    /**
     * Registers assign helper
     * - If name or value of the variable is not included in the defined handlebar, log an error.
     * - Store the name value pair in context.data.root
     * @returns {void}
     */
    register = () => {
        this.Handlebars.registerHelper("assign", (context: any) => {
            if (typeof context.hash.name === "undefined" || typeof context.hash.value === "undefined") {
                logger.error("name or value not specified.");
                return;
            } else {
                context.data.root[context.hash.name] = context.hash.value;
                logger.debug(`Assigned Value ${context.hash.value} to ${context.hash.name}`)
            }
        });
    };
}
