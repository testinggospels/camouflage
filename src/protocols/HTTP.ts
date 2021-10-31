import express from "express";
import http from "http";
import logger from "../logger";
import fs from "fs";
import https from "https";
import spdy from "spdy";

export default class HttpSetup {
    private app: express.Application;
    private port: number;
    private httpsPort: number;
    private grpcMocksDir: string;
    /**
     *
     * @param {express.Application} app Express application to form the listener for http and https server
     * @param {number} port HTTP server port
     * @param {number} httpsPort HTTPs server port - currently initialized in constructor optionally but in future it'll be initialized if https is enabled
     */
    constructor(app: express.Application, port: number, httpsPort?: number) {
        this.app = app;
        this.port = port;
        this.httpsPort = httpsPort;
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
    initHttps = (key: string, cert: string) => {
        const privateKey = fs.readFileSync(key, "utf8");
        const certificate = fs.readFileSync(cert, "utf8");
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
    initHttp2 = (http2Port: number, http2key: string, http2cert: string) => {
        spdy
            .createServer(
                {
                    key: fs.readFileSync(http2key),
                    cert: fs.readFileSync(http2cert),
                },
                this.app
            )
            .listen(http2Port, (err: any) => {
                if (err) logger.error(err.message);
                logger.info(`Worker sharing HTTP2 server at https://localhost:${http2Port} ⛳`);
            });
    };
}