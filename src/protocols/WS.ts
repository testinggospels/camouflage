import WebsocketParser from "../parser/WebsocketParser";
import logger from "../logger";
import { IncomingMessage } from "http";
import { v4 as uuidv4 } from "uuid";
const clients: string[] = [];
import WebSocket from "ws";
import path from "path";
import fs from "fs";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";

export default class WsSetup {
    private config: CamouflageConfig;
    constructor() {
        this.config = getLoaderInstance().getConfig()
    }
    /**
   * Initializes a WebSocketserver
   * @param {number} wsPort
   * @param {string} wsMockDir
   */
    initws = () => {
        const wss = new WebSocket.Server({ port: this.config.protocols.ws.port });
        logger.info(`Worker sharing WS server at ws://localhost:${this.config.protocols.ws.port} ⛳`);
        const websocketParser = new WebsocketParser(wss);
        wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
            const clientId = uuidv4();
            clients.push(clientId);
            // @ts-ignore
            ws["clientId"] = clientId;
            let mockFile = path.join(this.config.protocols.ws.mocks_dir, ...request.url.substring(1).split("/"), "connection.mock");
            if (fs.existsSync(mockFile)) {
                websocketParser.sendConnect(ws, request, clients, clientId, "joining", mockFile);
            } else {
                websocketParser.sendConnect(ws, request, clients, clientId, "joining");
            }
            ws.on("message", (message) => {
                logger.debug(`Client sent message ${message}`);
                mockFile = path.join(this.config.protocols.ws.mocks_dir, ...request.url.substring(1).split("/"), "message.mock");
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