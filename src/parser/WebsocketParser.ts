import Handlebars from "handlebars";
import fs from "fs";
import { IncomingMessage } from "http";
import logger from "../logger";
import WebSocket from "ws";

export default class WebsocketParser {
  private wss: any;
  constructor(wss: any) {
    this.wss = wss;
  }
  send = (mockFile: string, ws: WebSocket, request: IncomingMessage, incomingMessage?: any): void => {
    const template = Handlebars.compile(fs.readFileSync(mockFile).toString());
    let message: WebSocketMessage;
    let delay: number;
    try {
      message = JSON.parse(template({ request: request }));
      delay = message.delay || 0;
      logger.debug(`Delay set to ${delay}`);

      if (message.broadcast) {
        this.wss.clients.forEach(function each(client: WebSocket) {
          if (client.readyState === WebSocket.OPEN) {
            setTimeout(() => {
              client.send(message.broadcast);
              logger.debug(`Responded with ${message.broadcast}`);
            }, delay);
          }
        });
      }
      if (message.self) {
        setTimeout(() => {
          ws.send(message.self);
          logger.debug(`Responded with ${message.self}`);
        }, delay);
      }
      if (message.emit) {
        this.wss.clients.forEach((client: WebSocket) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            setTimeout(() => {
              client.send(message.emit);
              logger.debug(`Responded with ${message.emit}`);
            }, delay);
          }
        });
      }
    } catch (e) {
      logger.error(e.message);
    }
  };
  sendConnect = (ws: WebSocket, request: IncomingMessage, clients: string[], clientId: string, status: string, mockFile?: string): void => {
    let clientsInfo = {
      clients: clients,
      client: clientId,
      status: status,
    };
    if (mockFile) {
      this.send(mockFile, ws, request);
      logger.debug(`Added client ${clientId}`);
    } else {
      if (status === "joining") {
        logger.warn(`No suitable connection.mock file found for ${request.url}`);
      }
    }
    this.wss.clients.forEach(function each(client: WebSocket) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(clientsInfo));
      }
    });
  };
}

interface WebSocketMessage {
  emit?: any;
  broadcast?: any;
  self?: any;
  delay?: number;
}
