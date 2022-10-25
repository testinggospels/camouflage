import thrift from 'thrift';
import fs from 'fs';
import path from 'path';
import logger from "../logger";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";
import { getHandlebars } from '../handlebar'
const Handlebars = getHandlebars()

export default class ThriftSetup {
    private config: CamouflageConfig;
    constructor() {
        this.config = getLoaderInstance().getConfig()
    }
    initThrift = () => {
        /*eslint-disable */
        const handlers: Record<string, Function> = {}
        /*eslint-enable */
        this.config.protocols.thrift.services.forEach((service: ThriftConfig) => {
            service.handlers.forEach((handler: string) => {
                handlers[handler] = async (request: any, response: any) => {
                    let DELAY = 0;
                    logger.debug(`Thrift Request for ${handler} handler: ${JSON.stringify(request)}`)
                    const mockFilePath = path.resolve(this.config.protocols.thrift.mocks_dir, `${handler}.mock`)
                    logger.debug(`Mock file path: ${mockFilePath}`);
                    const template = Handlebars.compile(fs.readFileSync(mockFilePath).toString());
                    const fileContent = await template({ request })
                    logger.debug(`Thrift Response for ${handler} handler: ${fileContent}`);
                    const reply = JSON.parse(fileContent)
                    if (typeof reply["delay"] !== 'undefined') {
                        DELAY = reply["delay"]
                        delete reply["delay"]
                    }
                    setTimeout(() => {
                        response(null, reply)
                    }, DELAY)
                }
            });
            try {
                /*eslint-disable */
                thrift.createServer(require(service.service), handlers).listen(service.port, () => {
                    logger.info(`Worker sharing Thrift server for ${service.service} on ${service.port} ⛳`)
                });
                /*eslint-enable */
            } catch (err) {
                logger.error(`Failed to start thrift server for ${service.service}. ${err.message}`)
            }
        });
    }
}

export interface ThriftConfig {
    port: number,
    service: string,
    handlers: string[]
}