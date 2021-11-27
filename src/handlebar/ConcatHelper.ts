import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - concat
 */
export class ConcatHelper {
    private Handlebars: any;
    constructor(Handlebars: any) {
        this.Handlebars = Handlebars
    }
    /**
     * Registers concat helper
     * - concat all strings to form one string
     * - Potentially can by concatenated by a delimiter - TODO
     * @returns {void}
     */
    register = () => {
        this.Handlebars.registerHelper("concat", (...args: string[]) => {
            args.pop();
            logger.debug(`Concatenated String: ${args.join("")} `)
            return args.join("");
        });
    };
}
