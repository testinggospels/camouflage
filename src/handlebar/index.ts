import { HandlerBarHelper } from "./handleBarDefinition";
import logger from "../logger";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 */
const registerHandlebars = () => {
  logger.info("Handlebar helpers registration started");
  const handlerBarHelper = new HandlerBarHelper();
  handlerBarHelper.nowHelper();
  handlerBarHelper.randomValueHelper();
  handlerBarHelper.requestHelper();
  handlerBarHelper.numBetweenHelper();
  handlerBarHelper.fileHelper();
  handlerBarHelper.codeHelper();
  handlerBarHelper.injectHelper();
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
