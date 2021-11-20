import thrift from 'thrift';
import fs from 'fs';
import path from 'path';
import logger from "../logger";
import { getHandlebars } from '../handlebar'
const Handlebars = getHandlebars()

export default class ThriftSetup {
    initThrift = (thriftMocksDir: string, thriftServices: ThriftConfig[]) => {
        const handlers: Record<string, Function> = {}
        thriftServices.forEach((service: ThriftConfig) => {
            service.handlers.forEach((handler: string) => {
                handlers[handler] = async (request: any, response: any) => {
                    let DELAY = 0;
                    logger.debug(`Thrift Request for ${handler} handler: ${JSON.stringify(request)}`)
                    const mockFilePath = path.resolve(thriftMocksDir, `${handler}.mock`)
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
            thrift.createServer(require(service.service), handlers).listen(service.port, () => {
                logger.info(`Worker sharing Thrift server for ${service.service} on ${service.port} ⛳`)
            })
        });
    }
}

export interface ThriftConfig {
    port: number,
    service: string,
    handlers: string[]
}