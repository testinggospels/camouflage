import path from "path";
import fs from "fs";
import os from "os";
import logger from "../logger";
import { getHandlebars } from '../handlebar'
import { getLoaderInstance } from "../ConfigLoader";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
const Handlebars = getHandlebars()
/**
 * Parser class for GRPC Protocol mocks to define handlers for:
 * - Unary calls
 * - Server streaming calls
 * - Client streaming calls
 * - Bidirectional streaming calls
 */
export default class GrpcParser {
  private config: CamouflageConfig;
  constructor() {
    this.config = getLoaderInstance().getConfig()
  }
  /**
   * - Get the path of the determined handler from the call
   * - Find a mock file for the handler
   * - If mock file exists, apply handler compilation to generate actual values from helpers
   * - Execute callback with the response and delay
   * - Remove delay key if present before sending the response
   * - If mock file is not found, log error and send the same error to client
   * @param {any} call call object recieved with every unary call
   * @param {any} callback callback to be executed once server is ready to return response
   */
  camouflageMock = async (call: any, callback: any) => {
    try {
      const handlerPath = call.call.handler.path;
      const mockFile = handlerPath.replace(/\./g, "/");
      const mockFilePath = path.join(this.config.protocols.grpc.mocks_dir, mockFile + ".mock");
      if (fs.existsSync(mockFilePath)) {
        const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
        logger.debug(`Unary Request: ${JSON.stringify(call.request)}. Metadata: ${JSON.stringify(call.metadata)}`)
        const fileContent = await template({ request: call.request, metadata: call.metadata });
        logger.debug(`Mock file path: ${mockFilePath}`);
        logger.debug(`Response: ${fileContent}`);
        const response = JSON.parse(fileContent);
        const delay: number = response.delay || 0;
        delete response.delay;
        setTimeout(() => {
          callback(null, response);
        }, delay);
      } else {
        logger.error(`No suitable mock file was found for ${mockFilePath}`);
        callback(null, { error: `No suitable mock file was found for ${mockFilePath}` });
      }
    } catch (error) {
      logger.error(error);
      callback(null, { error: error });
    }
  };
  /**
   * - Get the path of the determined handler from the call
   * - Find a mock file for the handler
   * - If mock file exists, apply handler compilation to generate actual values from helpers
   * - Split the contents of file with ==== to get responses each stream
   * - Run a forEach and execute call.write() with the response and delay
   * - On last index of streamArray, execute call.end()
   * - Remove delay key if present before sending the response
   * - If mock file is not found, log error and send the same error to client
   * @param {any} call call object recieved with every call to server stream
   */
  camouflageMockServerStream = async (call: any) => {
    const handlerPath = call.call.handler.path;
    const mockFile = handlerPath.replace(/\./g, "/");
    const mockFilePath = path.join(this.config.protocols.grpc.mocks_dir, mockFile + ".mock");
    if (fs.existsSync(mockFilePath)) {
      try {
        const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
        logger.debug(`Server Stream Request: ${JSON.stringify(call.request)}. Metadata ${JSON.stringify(call.metadata)}`)
        const fileContent = await template({ request: call.request, metadata: call.metadata });
        logger.debug(`Mock file path: ${mockFilePath}`);
        const streamArr = fileContent.split("====");
        let delay = 0;
        streamArr.forEach((stream: any, index: number) => {
          const parsedStream = JSON.parse(stream.replace(os.EOL, ""));
          delay = delay + (parsedStream.delay || 0);
          delete parsedStream["delay"];
          logger.debug(`Sending stream: ${JSON.stringify(parsedStream, null, 2)}`);
          logger.debug(`Sending stream with delay of: ${delay}`);
          switch (index) {
            case streamArr.length - 1:
              setTimeout(() => {
                call.write(JSON.parse(stream));
                call.end();
              }, delay);
              break;
            default:
              setTimeout(() => {
                call.write(JSON.parse(stream));
              }, delay);
              break;
          }
        });
      } catch (error) {
        logger.error(error);
        call.end();
      }
    } else {
      logger.error(`No suitable mock file was found for ${mockFilePath}`);
      call.write({ error: `No suitable mock file was found for ${mockFilePath}` });
      call.end();
    }
  };
  /**
   * - Get the path of the determined handler from the call
   * - Find a mock file for the handler
   * - If mock file exists, apply handler compilation to generate actual values from helpers
   * - No action required on recieving client's streams
   * - Once client calls end, respond with the compiled contents of the mockfile and delay
   * - Remove delay key if present before sending the response
   * - If mock file is not found, log error and send the same error to client
   * @param {any} call call object recieved with every stream call from client
   * @param {any} callback callback to be executed once server is ready to return response
   */
  camouflageMockClientStream = (call: any, callback: any) => {
    const requests: any[] = []
    call.on("data", (data: any) => {
      logger.debug(`Recieved Client Stream: ${JSON.stringify(data, null, 2)}`)
      requests.push(data)
    });
    call.on("end", async () => {
      try {
        const handlerPath = call.call.handler.path;
        const mockFile = handlerPath.replace(/\./g, "/");
        const mockFilePath = path.join(this.config.protocols.grpc.mocks_dir, mockFile + ".mock");
        if (fs.existsSync(mockFilePath)) {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          const fileContent = await template({ request: requests });
          logger.debug(`Mock file path: ${mockFilePath}`);
          logger.debug(`Response: ${fileContent}`);
          const response = JSON.parse(fileContent);
          const delay: number = response.delay || 0;
          delete response.delay;
          setTimeout(() => {
            callback(null, response);
          }, delay);
        } else {
          logger.error(`No suitable mock file was found for ${mockFilePath}`);
          callback(null, { error: `No suitable mock file was found for ${mockFilePath}` });
        }
      } catch (error) {
        logger.error(error);
        callback(null, { error: error });
      }
    });
  };
  /**
   * - Get the path of the determined handler from the call
   * - Find a mock file for the handler
   * - If mock file exists, apply handler compilation to generate actual values from helpers
   * - Follow a ping pong model, i.e. for every client's stream, respond with a server stream.
   * - On client stream, respond with filecontent.data
   * - Once client calls end, respond with filecontent.end
   * - Remove delay key if present before sending the response
   * - If mock file is not found, log error and send the same error to client
   * @param {any} call call object recieved with every stream call from client to a serverside streaming call
   */
  camouflageMockBidiStream = (call: any) => {
    const handlerPath = call.call.handler.path;
    const mockFile = handlerPath.replace(/\./g, "/");
    const mockFilePath = path.join(this.config.protocols.grpc.mocks_dir, mockFile + ".mock");
    const requests: any[] = []
    call.on("data", async (data: any) => {
      if (fs.existsSync(mockFilePath)) {
        try {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          logger.debug(`Recieved Client Stream: ${JSON.stringify(data, null, 2)}`)
          requests.push(data)
          const fileContent = await template({ request: data });
          logger.debug(`Mock file path: ${mockFilePath}`);
          logger.debug(`Response: ${fileContent}`);
          const response = JSON.parse(fileContent);
          const delay: number = response.data.delay || 0;
          delete response.data.delay;
          setTimeout(() => {
            call.write(response.data);
          }, delay);
        } catch (error) {
          logger.error(error);
          call.end();
        }
      } else {
        logger.error(`No suitable mock file was found for ${mockFilePath}`);
        call.write({ error: `No suitable mock file was found for ${mockFilePath}` });
        call.end();
      }
    });
    call.on("end", async () => {
      if (fs.existsSync(mockFilePath)) {
        try {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          const fileContent = await template({ request: requests });
          logger.debug(`Mock file path: ${mockFilePath}`);
          logger.debug(`Response: ${fileContent}`);
          const response = JSON.parse(fileContent);
          if (response.end) {
            const delay: number = response.end.delay || 0;
            delete response.end.delay;
            setTimeout(() => {
              call.write(response.end);
              call.end();
            }, delay);
          } else {
            call.end();
          }
        } catch (error) {
          logger.error(error);
          call.end();
        }
      } else {
        logger.error(`No suitable mock file was found for ${mockFilePath}`);
        call.write({ error: `No suitable mock file was found for ${mockFilePath}` });
        call.end();
      }
    });
  };
}
