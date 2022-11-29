import path from "path";
import { readFileSync, existsSync } from "fs";
import express, {Request} from "express";
import { soap } from "express-soap";
import { WSDL } from "soap";
import http from "http";
import axios from "axios";
import logger from "../logger";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";
import { sleep } from "../sleep";
import { getHandlebars } from "../handlebar";
const Handlebars = getHandlebars();

export default class SoapSetup {
  private config: CamouflageConfig;
  private app: express.Application;
  private port: number;

  constructor() {
    this.config = getLoaderInstance().getConfig();
    this.app = express();
    this.port = this.config.protocols.soap.port;
  }
  initSoap = async () => {
    const services = this.config.protocols.soap.services || [];
    for (let x = 0; x < services.length; x++) {
      const service = services[x];

      let wsdlContent;
      if (existsSync(service.wsdl)) {
        wsdlContent = readFileSync(service.wsdl).toString();
      } else {
        const { data } = await axios.get(service.wsdl);
        wsdlContent = data;
      }

      const wsdl = new WSDL(wsdlContent, "", {});
      const soapServices = Object.entries(
        await new Promise((resolve, reject) => {
          wsdl.onReady((err) => {
            if (err) return reject(err);
            wsdl.describeServices().then((services: any) => {
              resolve(services);
            })
          });
        })
      );

      const middlewareService: any = {};
      soapServices.forEach(([serviceName, ports]) => {
        middlewareService[serviceName] = {};
        Object.entries(ports).forEach(([portName, methods]) => {
          middlewareService[serviceName][portName] = {};
          Object.entries(methods).forEach(([methodName]) => {
            middlewareService[serviceName][portName][methodName] = async (
              args: any,
              cb: (body: any) => void,
              _headers: any,
              request: Request
            ) => {
              let DELAY = 0;
              const handler = `${serviceName}/${portName}/${methodName}`;
              logger.debug(
                `Soap Request for ${handler} handler: ${JSON.stringify(
                  args
                )}`
              );
              const mockFilePath = path.resolve(
                this.config.protocols.soap.mocks_dir,
                `${handler}.mock`
              );
              logger.debug(`Mock file path: ${mockFilePath}`);
              const template = Handlebars.compile(
                readFileSync(mockFilePath).toString()
              );

              // add arguments to the request body
              request.body = args
              
              const fileContent = await template({ request, logger });
              logger.debug(
                `Soap Response for ${handler} handler: ${fileContent}`
              );
              const reply = JSON.parse(fileContent);
              if (typeof reply["delay"] !== "undefined") {
                DELAY = reply["delay"];
                delete reply["delay"];
              }
              await sleep(DELAY);
              cb(reply.body);
            };
          });
        });
      });

      this.app.use(
        service.path,
        soap({
          services: middlewareService,
          wsdl: wsdlContent,
          suppressStack: false,
        })
      );
    }

    http.createServer(this.app).listen(this.port, () => {
      logger.info(
        `Worker sharing SOAP server at http://localhost:${this.port} ⛳`
      );
    });
  };
}

export interface SoapConfig {
  wsdl: string;
  path: string;
}
