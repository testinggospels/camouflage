import registerCustomHandlebars from "./loadCustomHandlebars";
import logger from "../logger";
import { CsvHelper } from "./CsvHelper";
import { NowHelper } from "./NowHelper";
import { RandomValueHelper } from "./RandomValueHelper";
import { RequestHelper } from "./RequestHelper";
import { NumBetweenHelper } from "./NumBetweenHelper";
import { FileHelper } from "./FileHelper";
import { CodeHelper } from "./CodeHelper";
import { InjectHelper } from "./InjectHelper";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * @param {string} extHelpers location of the external handlebars json file
 */
const registerHandlebars = (extHelpers: string) => {
  logger.info("Handlebar helpers registration started");
  const csvHelper = new CsvHelper();
  const nowHelper = new NowHelper();
  const randomValueHelper = new RandomValueHelper();
  const requestHelper = new RequestHelper();
  const numBetweenHelper = new NumBetweenHelper();
  const fileHelper = new FileHelper();
  const codeHelper = new CodeHelper();
  const injectHelper = new InjectHelper();
  nowHelper.register();
  randomValueHelper.register();
  requestHelper.register();
  numBetweenHelper.register();
  fileHelper.register();
  codeHelper.register();
  injectHelper.register();
  csvHelper.register();
  if (extHelpers !== null) {
    registerCustomHandlebars(extHelpers);
  }
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
