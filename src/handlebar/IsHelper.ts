import Handlebars from "handlebars";
import logger from "../logger";
/**
 * Defines and registers custom handlebar helper - is
 */
export class IsHelper {
    /**
     * Registers is helper
     * - Extends builtin if helper functionalities
     * @returns {void}
     */
    register = () => {
        Handlebars.registerHelper("is", (...args) => {
            let left: any;
            let right: any;
            let operator: any;
            let context: any;
            switch (args.length) {
                case 2:
                    left = args[0];
                    context = args[1];
                    if (left) {
                        return context.fn(this);
                    } else {
                        return context.inverse(this);
                    }
                case 3:
                    left = args[0];
                    right = args[1];
                    context = args[2];
                    if (left === right) {
                        return context.fn(this);
                    } else {
                        return context.inverse(this);
                    }
                case 4:
                    left = args[0]
                    operator = args[1]
                    right = args[2]
                    context = args[3]
                    if (this.evaluateOperator(operator, left, right)) {
                        return context.fn(this);
                    } else {
                        return context.inverse(this);
                    }
                default:
                    logger.error("Incorrect number of arguments")
                    break;
            }
            return true;
        });
    };
    private evaluateOperator = (operator: string, left: any, right: any | any[]) => {
        switch (operator) {
            case "not":
                return left != right;
            case ">":
                return left > right;
            case "<":
                return left < right;
            case ">=":
                return left >= right;
            case "<=":
                return left <= right;
            case "===":
                return left === right;
            case "!==":
                return left !== right;
            default:
                break;
        }
    }
}