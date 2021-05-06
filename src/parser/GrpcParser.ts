import path from "path";
import fs from "fs";
import os from "os";
import logger from "../logger";
import Handlebars from "handlebars";

export default class GrpcParser {
  private grpcMocksDir: string;
  constructor(grpcMocksDir: string) {
    this.grpcMocksDir = grpcMocksDir;
  }
  camouflageMock = (call: any, callback: any) => {
    try {
      let handlerPath = call.call.handler.path;
      let mockFile = handlerPath.replace(".", "/");
      let mockFilePath = path.join(this.grpcMocksDir, mockFile + ".mock");
      if (fs.existsSync(mockFilePath)) {
        const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
        const fileContent = template({ request: call.request });
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

  camouflageMockServerStream = (call: any, callback: any) => {
    let handlerPath = call.call.handler.path;
    let mockFile = handlerPath.replace(".", "/");
    let mockFilePath = path.join(this.grpcMocksDir, mockFile + ".mock");
    if (fs.existsSync(mockFilePath)) {
      try {
        const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
        const fileContent = template({ request: call.request });
        logger.debug(`Mock file path: ${mockFilePath}`);
        let streamArr = fileContent.split("====");
        let delay: number = 0;
        streamArr.forEach((stream: any, index: number) => {
          let parsedStream = JSON.parse(stream.replace(os.EOL, ""));
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

  camouflageMockClientStream = (call: any, callback: any) => {
    call.on("data", () => {
      // TODO: Not sure if it's needed
    });
    call.on("end", () => {
      try {
        let handlerPath = call.call.handler.path;
        let mockFile = handlerPath.replace(".", "/");
        let mockFilePath = path.join(this.grpcMocksDir, mockFile + ".mock");
        if (fs.existsSync(mockFilePath)) {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          const fileContent = template({ request: call.request });
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

  camouflageMockBidiStream = (call: any, callback: any) => {
    let handlerPath = call.call.handler.path;
    let mockFile = handlerPath.replace(".", "/");
    let mockFilePath = path.join(this.grpcMocksDir, mockFile + ".mock");
    call.on("data", () => {
      if (fs.existsSync(mockFilePath)) {
        try {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          const fileContent = template({ request: call.request });
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
    call.on("end", () => {
      if (fs.existsSync(mockFilePath)) {
        try {
          const template = Handlebars.compile(fs.readFileSync(mockFilePath, "utf-8").toString());
          const fileContent = template({ request: call.request });
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
