import Handlebars from "handlebars";
import fs from "fs";
import { IncomingMessage } from "http";
import logger from "../logger";
import WebSocket from "ws";
/**
 * Parser class for Websocket Protocol mocks
 */
export default class WebsocketParser {
  private wss: any;
  /**
   *
   * @param {any} wss Instance of WebSocket server
   */
  constructor(wss: any) {
    this.wss = wss;
  }
  /**
   * Compiles and transforms the handlerbars in a given mockfile and according to the key, i.e.
   * - broadcast
   * - emit; or
   * - self
   * sends the message from message.mock
   * If it's the first message to be sent after connection, mockfile would be connection.mock
   * @param {string} mockFile mockFile for the current connection
   * @param {WebSocket} ws current socket
   * @param {IncomingMessage} request incoming request
   * @param {any} incomingMessage incoming data
   */
  send = (mockFile: string, ws: WebSocket, request: IncomingMessage, incomingMessage?: any): void => {
    const template = Handlebars.compile(fs.readFileSync(mockFile).toString());
    let message: WebSocketMessage;
    let delay: number;
    try {
      message = JSON.parse(template({ request: request, message: incomingMessage }));
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
  /**
   * Sends a list of current clients connected to the server, id of the new client, and status (joining or leaving)
   * @param {WebSocket} ws current socket
   * @param {IncomingMessage} request Incoming request
   * @param {string[]} clients List of existin clients
   * @param {string} clientId new clientId
   * @param {string} status joining or leaving
   * @param {string} mockFile mockfile, i.e. connection.mock
   */
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
