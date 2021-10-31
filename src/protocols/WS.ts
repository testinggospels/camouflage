import WebsocketParser from "../parser/WebsocketParser";
import logger from "../logger";
import { IncomingMessage } from "http";
import { v4 as uuidv4 } from "uuid";
const clients: string[] = [];
import WebSocket from "ws";
import path from "path";
import fs from "fs";

export default class WsSetup {
    /**
   * Initializes a WebSocketserver
   * @param {number} wsPort
   * @param {string} wsMockDir
   */
    initws = (wsPort: number, wsMockDir: string) => {
        const wss = new WebSocket.Server({ port: wsPort });
        logger.info(`Worker sharing WS server at ws://localhost:${wsPort} ⛳`);
        const websocketParser = new WebsocketParser(wss);
        wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
            const clientId = uuidv4();
            clients.push(clientId);
            // @ts-ignore
            ws["clientId"] = clientId;
            let mockFile = path.join(wsMockDir, ...request.url.substring(1).split("/"), "connection.mock");
            if (fs.existsSync(mockFile)) {
                websocketParser.sendConnect(ws, request, clients, clientId, "joining", mockFile);
            } else {
                websocketParser.sendConnect(ws, request, clients, clientId, "joining");
            }
            ws.on("message", (message) => {
                logger.debug(`Client sent message ${message}`);
                mockFile = path.join(wsMockDir, ...request.url.substring(1).split("/"), "message.mock");
                if (fs.existsSync(mockFile)) {
                    websocketParser.send(mockFile, ws, request, message);
                } else {
                    logger.error(`No suitable message.mock file found for ${request.url}`);
                }
            });
            ws.on("close", () => {
                clients.splice(clients.indexOf(clientId), 1);
                websocketParser.sendConnect(ws, request, clients, clientId, "leaving");
            });
        });
    };
}