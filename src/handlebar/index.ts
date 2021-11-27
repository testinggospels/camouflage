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
import { PgHelper } from "./PgHelper";
import { ArrayHelper } from "./ArrayHelper";
import promisedHandlebars from 'promised-handlebars';
import { getLoaderInstance } from '../ConfigLoader'
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import * as Q from 'q';
import Handlebars from 'handlebars';
import { AssignHelper } from "./AssignHelper";
import { ConcatHelper } from "./ConcatHelper";
const HandlebarsPromised = promisedHandlebars(Handlebars, { Promise: Q.Promise })
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 * - If external helper is null, do not call registerCustomHandlebars()
 * - If injection is false, do not register code, inject, pg, csv and external heleprs
 */
export const registerHandlebars = () => {
  const config: CamouflageConfig = getLoaderInstance().getConfig();
  logger.info("Handlebar helpers registration started");
  new NowHelper(HandlebarsPromised).register();
  new RandomValueHelper(HandlebarsPromised).register();
  new RequestHelper(HandlebarsPromised).register();
  new NumBetweenHelper(HandlebarsPromised).register();
  new FileHelper(HandlebarsPromised).register();
  new FaultHelper(HandlebarsPromised).register();
  new IsHelper(HandlebarsPromised).register();
  new ArrayHelper(HandlebarsPromised).register();
  new AssignHelper(HandlebarsPromised).register();
  new ConcatHelper(HandlebarsPromised).register();
  if (config.injection.enable) {
    logger.warn("Code Injection is enabled.")
    new CodeHelper(HandlebarsPromised).register();
    new InjectHelper(HandlebarsPromised).register();
    new PgHelper(HandlebarsPromised).register();
    new CsvHelper(HandlebarsPromised).register();
    if (config.ext_helpers !== null) {
      registerCustomHandlebars(HandlebarsPromised, config.ext_helpers);
    }
  } else {
    logger.warn("Code Injection is disabled. Helpers such as code, inject, pg, csv and functionalities such as external helpers, will not work.")
  }
  new ProxyHelper(HandlebarsPromised).register();
  logger.info("Handlebar helpers registration completed");
};

export const getHandlebars = () => {
  return HandlebarsPromised;
}