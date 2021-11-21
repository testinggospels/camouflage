import express from "express";
import http from "http";
import logger from "../logger";
import fs from "fs";
import https from "https";
import spdy from "spdy";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";

export default class HttpSetup {
    private app: express.Application;
    private port: number;
    private httpsPort: number;
    private config: CamouflageConfig
    /**
     *
     * @param {express.Application} app Express application to form the listener for http and https server
     * @param {number} port HTTP server port
     * @param {number} httpsPort HTTPs server port - currently initialized in constructor optionally but in future it'll be initialized if https is enabled
     */
    constructor(app: express.Application) {
        this.config = getLoaderInstance().getConfig()
        this.app = app;
        this.port = this.config.protocols.http.port;
        this.httpsPort = this.config.protocols.https.port;
    }
    /**
     * Initialize HTTP server at specified port
     * @returns {void}
     */
    initHttp = (): void => {
        http.createServer(this.app).listen(this.port, () => {
            logger.info(`Worker sharing HTTP server at http://localhost:${this.port} ⛳`);
            this.app.emit("server-started");
        });
    };
    /**
   * Initialize HTTPs server at specified port
   * @param {string} key location of server.key file
   * @param {string} cert location of server.cert file
   * @returns {void}
   */
    initHttps = () => {
        const privateKey = fs.readFileSync(this.config.ssl.key, "utf8");
        const certificate = fs.readFileSync(this.config.ssl.cert, "utf8");
        const credentials = { key: privateKey, cert: certificate };
        https.createServer(credentials, this.app).listen(this.httpsPort, () => {
            logger.info(`Worker sharing HTTPs server at https://localhost:${this.httpsPort} ⛳`);
        });
    };
    /**
   * Initializes an HTTP2 server
   * @param {number} http2Port
   * @param {string} http2key
   * @param {string} http2cert
   */
    initHttp2 = () => {
        spdy
            .createServer(
                {
                    key: fs.readFileSync(this.config.ssl.key),
                    cert: fs.readFileSync(this.config.ssl.cert),
                },
                this.app
            )
            .listen(this.config.protocols.http2.port, (err: any) => {
                if (err) logger.error(err.message);
                logger.info(`Worker sharing HTTP2 server at https://localhost:${this.config.protocols.http2.port} ⛳`);
            });
    };
}