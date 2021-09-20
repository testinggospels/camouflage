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
import { ProxyHelper } from "./ProxyHelper";
import { FaultHelper } from "./FaultHelper";
import { IsHelper } from "./IsHelper";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * @param {string} extHelpers location of the external handlebars json file
 */
const registerHandlebars = (extHelpers: string, enableInjection: boolean) => {
  logger.info("Handlebar helpers registration started");
  new CsvHelper().register();
  new NowHelper().register();
  new RandomValueHelper().register();
  new RequestHelper().register();
  new NumBetweenHelper().register();
  new FileHelper().register();
  new FaultHelper().register();
  new IsHelper().register();
  if (enableInjection) {
    logger.warn("Code Injection is enabled.")
    new CodeHelper().register();
    new InjectHelper().register();
    if (extHelpers !== null) {
      registerCustomHandlebars(extHelpers);
    }
  } else {
    logger.warn("Code Injection is disabled. Handlebars such as code and inject and functionalities such as external helpers, will not work. ")
  }
  new ProxyHelper().register();
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
