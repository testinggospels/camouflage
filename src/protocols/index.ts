import express from "express";
import HttpSetup from "./HTTP";
import WsSetup from "./WS";
import * as protoLoader from "@grpc/proto-loader";
import GrpcSetup from "./GRPC";
import ThriftSetup from "./Thrift";
import SoapSetup from "./Soap";
/**
 * Defines all protocols:
 * Currently active:
 * - HTTP
 * - HTTPS
 * - HTTP2
 * - gRPC
 * - Websocket
 * - SOAP
 * @param {string} grpcMocksDir location of grpc mocks, not initialized as constructor variable, because grpc is an optional protocol
 *                              instead it will be initialized in initGRPC method, if called.
 */
export default class Protocols {
  private httpSetup: HttpSetup;
  private wsSetup: WsSetup;
  private grpcSetup: GrpcSetup;
  private thriftSetup: ThriftSetup;
  private soapSetup: SoapSetup;
  /**
   *
   * @param {express.Application} app Express application to form the listener for http and https server
   */
  constructor(app: express.Application) {
    this.httpSetup = new HttpSetup(app);
    this.wsSetup = new WsSetup();
    this.grpcSetup = new GrpcSetup();
    this.thriftSetup = new ThriftSetup();
    this.soapSetup = new SoapSetup();
  }
  initHttp = (): void => {
    this.httpSetup.initHttp();
  };
  initHttps = () => {
    this.httpSetup.initHttps();
  };
  initHttp2 = () => {
    this.httpSetup.initHttp2();
  };
  initws = () => {
    this.wsSetup.initws();
  };
  initGrpc = (protoIgnore: string[], plconfig: protoLoader.Options) => {
    this.grpcSetup.initGrpc(protoIgnore, plconfig);
  };
  initThrift = () => {
    this.thriftSetup.initThrift();
  };
  initSoap = () => {
    this.soapSetup.initSoap();
  };
}
