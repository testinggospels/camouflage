import express from "express";
import HttpSetup from "./HTTP";
import WsSetup from "./WS";
import * as protoLoader from "@grpc/proto-loader";
import GrpcSetup from "./GRPC";
import ThriftSetup, { ThriftConfig } from "./Thrift";
/**
 * Defines all protocols:
 * Currently active:
 * - HTTP
 * - HTTPS
 * - HTTP2
 * - gRPC
 * - Websocket
 * @param {string} grpcMocksDir location of grpc mocks, not initialized as constructor variable, because grpc is an optional protocol
 *                              instead it will be initialized in initGRPC method, if called.
 */
export default class Protocols {
  private httpSetup: HttpSetup;
  private wsSetup: WsSetup;
  private grpcSetup: GrpcSetup;
  private thriftSetup: ThriftSetup;
  /**
   *
   * @param {express.Application} app Express application to form the listener for http and https server
   * @param {number} port HTTP server port
   * @param {number} httpsPort HTTPs server port - currently initialized in constructor optionally but in future it'll be initialized if https is enabled
   */
  constructor(app: express.Application, port: number, httpsPort?: number) {
    this.httpSetup = new HttpSetup(app, port, httpsPort);
    this.wsSetup = new WsSetup();
    this.grpcSetup = new GrpcSetup();
    this.thriftSetup = new ThriftSetup();
  }
  initHttp = (): void => {
    this.httpSetup.initHttp()
  }
  initHttps = (key: string, cert: string) => {
    this.httpSetup.initHttps(key, cert)
  };
  initHttp2 = (http2Port: number, http2key: string, http2cert: string) => {
    this.httpSetup.initHttp2(http2Port, http2key, http2cert)
  };
  initws = (wsPort: number, wsMockDir: string) => {
    this.wsSetup.initws(wsPort, wsMockDir);
  }
  initGrpc = (grpcProtosDir: string, grpcMocksDir: string, grpcHost: string, grpcPort: number, protoIgnore: string[], plconfig: protoLoader.Options) => {
    this.grpcSetup.initGrpc(grpcProtosDir, grpcMocksDir, grpcHost, grpcPort, protoIgnore, plconfig);
  }
  initThrift = (thriftMocksDir: string, thriftServices: ThriftConfig[]) => {
    this.thriftSetup.initThrift(thriftMocksDir, thriftServices);
  }
}
