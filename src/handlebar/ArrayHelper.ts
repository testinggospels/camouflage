import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - array
 */
export class ArrayHelper {
    private Handlebars: any;
    constructor(Handlebars: any) {
        this.Handlebars = Handlebars
    }
    /**
     * Registers array helper
     * - If source or delimiter is not included in the defined handlebar, log an error.
     * - Split the source string with specified delimiter
     * @returns {void}
     */
    register = () => {
        this.Handlebars.registerHelper("array", (context: any) => {
            if (typeof context.hash.source === "undefined" && typeof context.hash.delimiter === "undefined") {
                logger.error("Source / Delimiter not specified.");
            } else {
                const source: string = context.hash.source
                const delimiter: string = context.hash.delimiter
                return source.split(delimiter);
            }
        });
    };
}
