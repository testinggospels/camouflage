import { HandlerBarHelper } from "./handleBarDefinition";
import registerCustomHandlebars from "./loadCustomHandlebars";
import logger from "../logger";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * @param {string} extHelpers location of the external handlebars json file
 */
const registerHandlebars = (extHelpers: string) => {
  logger.info("Handlebar helpers registration started");
  const handlerBarHelper = new HandlerBarHelper();
  handlerBarHelper.nowHelper();
  handlerBarHelper.randomValueHelper();
  handlerBarHelper.requestHelper();
  handlerBarHelper.numBetweenHelper();
  handlerBarHelper.fileHelper();
  handlerBarHelper.codeHelper();
  handlerBarHelper.injectHelper();
  if (extHelpers !== null) {
    registerCustomHandlebars(extHelpers);
  }
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
