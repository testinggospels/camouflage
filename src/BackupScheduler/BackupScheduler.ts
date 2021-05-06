// @ts-ignore
import * as scheduler from "node-cron";
import path from "path";
import os from "os";
// @ts-ignore
import * as fse from "fs-extra";
import logger from "../logger";

export default class BackupScheduler {
  private cron: string;
  private mocksDir: string;
  private grpcMocksDir: string;
  private grpcProtosDir: string;
  private key: string;
  private cert: string;
  private configFilePath: string;
  private configFileName: string;
  constructor(cron: string, mocksDir: string, grpcMocksDir: string, grpcProtosDir: string, key: string, cert: string, configFilePath: string) {
    this.cron = cron;
    this.mocksDir = mocksDir;
    this.grpcMocksDir = grpcMocksDir;
    this.grpcProtosDir = grpcProtosDir;
    this.key = key;
    this.cert = cert;
    this.configFilePath = configFilePath;
    this.configFileName = configFilePath.split(path.sep).slice(-1)[0];
  }
  schedule = (enableHttps: boolean, enableHttp2: boolean, enablegRPC: boolean) => {
    this.createBackup(enableHttps, enableHttp2, enablegRPC);
    scheduler.schedule(this.cron, () => {
      this.createBackup(enableHttps, enableHttp2, enablegRPC);
    });
    logger.info(`Scheduled a backup cron job with specified cron: ${this.cron}`);
  };
  private createBackup = (enableHttps: boolean, enableHttp2: boolean, enablegRPC: boolean) => {
    logger.debug("Creating a new back up.");
    fse.copySync(path.resolve(this.mocksDir), path.join(os.homedir(), ".camouflage_backup", "mocks"));
    if (enablegRPC) {
      fse.copySync(path.resolve(this.grpcMocksDir), path.join(os.homedir(), ".camouflage_backup", "grpc", "mocks"));
      fse.copySync(path.resolve(this.grpcProtosDir), path.join(os.homedir(), ".camouflage_backup", "grpc", "protos"));
    }
    if (enableHttps || enableHttp2) {
      fse.copySync(path.resolve(this.key), path.join(os.homedir(), ".camouflage_backup", "certs", "server.key"));
      fse.copySync(path.resolve(this.cert), path.join(os.homedir(), ".camouflage_backup", "certs", "server.cert"));
    }
    fse.copySync(path.resolve(this.configFilePath), path.join(os.homedir(), ".camouflage_backup", this.configFileName));
    logger.debug("Finished creating a new back up.");
  };
}
