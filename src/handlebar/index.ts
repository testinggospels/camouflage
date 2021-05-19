import { HandlerBarHelper } from "./handleBarDefinition";
import registerCustomHandlebars from "./loadCustomHandlebars";
import logger from "../logger";
import { CsvHelper } from "./CsvHelper";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * @param {string} extHelpers location of the external handlebars json file
 */
const registerHandlebars = (extHelpers: string) => {
  logger.info("Handlebar helpers registration started");
  const handlerBarHelper = new HandlerBarHelper();
  const csvHelper = new CsvHelper();
  handlerBarHelper.nowHelper();
  handlerBarHelper.randomValueHelper();
  handlerBarHelper.requestHelper();
  handlerBarHelper.numBetweenHelper();
  handlerBarHelper.fileHelper();
  handlerBarHelper.codeHelper();
  handlerBarHelper.injectHelper();
  csvHelper.csvHelper();
  if (extHelpers !== null) {
    registerCustomHandlebars(extHelpers);
  }
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
