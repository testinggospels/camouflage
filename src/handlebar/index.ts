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
// @ts-ignore
import promisedHandlebars from 'promised-handlebars';
import * as Q from 'q';
import { PgHelper } from "./PgHelper";
let Handlebars = promisedHandlebars(require('handlebars'), { Promise: Q.Promise })
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * @param {string} extHelpers location of the external handlebars json file
 */
export const registerHandlebars = (extHelpers: string, enableInjection: boolean) => {
  logger.info("Handlebar helpers registration started");
  new NowHelper(Handlebars).register();
  new RandomValueHelper(Handlebars).register();
  new RequestHelper(Handlebars).register();
  new NumBetweenHelper(Handlebars).register();
  new FileHelper(Handlebars).register();
  new FaultHelper(Handlebars).register();
  new IsHelper(Handlebars).register();
  if (enableInjection) {
    logger.warn("Code Injection is enabled.")
    new CodeHelper(Handlebars).register();
    new InjectHelper(Handlebars).register();
    new PgHelper(Handlebars).register();
    new CsvHelper(Handlebars).register();
    if (extHelpers !== null) {
      registerCustomHandlebars(Handlebars, extHelpers);
    }
  } else {
    logger.warn("Code Injection is disabled. Helpers such as code, inject, pg, csv and functionalities such as external helpers, will not work.")
  }
  new ProxyHelper(Handlebars).register();
  logger.info("Handlebar helpers registration completed");
};

export const getHandlebars = () => {
  return Handlebars;
}