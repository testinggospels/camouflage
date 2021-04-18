import { HandlerBarHelper } from "./handleBarDefinition";
import logger from "../logger";
const registerHandlebars = () => {
  logger.info("Handlebar helpers registration started");
  const handlerBarHelper = new HandlerBarHelper();
  handlerBarHelper.nowHelper();
  handlerBarHelper.randomValueHelper();
  handlerBarHelper.requestHelper();
  handlerBarHelper.numBetweenHelper();
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;

