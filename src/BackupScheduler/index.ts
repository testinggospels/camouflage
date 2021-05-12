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
  private wsMocksDir: string;
  private key: string;
  private cert: string;
  private configFilePath: string;
  private configFileName: string;
  constructor(
    cron: string,
    mocksDir: string,
    grpcMocksDir: string,
    grpcProtosDir: string,
    wsMocksDir: string,
    key: string,
    cert: string,
    configFilePath: string
  ) {
    this.cron = cron;
    this.mocksDir = mocksDir;
    this.grpcMocksDir = grpcMocksDir;
    this.grpcProtosDir = grpcProtosDir;
    this.wsMocksDir = wsMocksDir;
    this.key = key;
    this.cert = cert;
    this.configFilePath = configFilePath;
    this.configFileName = configFilePath.split(path.sep).slice(-1)[0];
  }
  /**
   * @param enableHttps
   * @param enableHttp2
   * @param enablegRPC
   * If above protocols are not enabled, camouflage will not look for directories specific to these protocols,
   * such as certs and grpc/mocks or grpc/protos while creating a backup
   */
  schedule = (enableHttps: boolean, enableHttp2: boolean, enablegRPC: boolean, enableWs: boolean) => {
    /**
     * Create an initial back up while starting the application.
     * Schedule further backup as specified by cron schedule in config
     */
    this.createBackup(enableHttps, enableHttp2, enablegRPC, enableWs);
    scheduler.schedule(this.cron, () => {
      this.createBackup(enableHttps, enableHttp2, enablegRPC, enableWs);
    });
    logger.info(`Scheduled a backup cron job with specified cron: ${this.cron}`);
  };
  /**
   * @param enableHttps
   * @param enableHttp2
   * @param enablegRPC
   * If above protocols are not enabled, camouflage will not look for directories specific to these protocols,
   * such as certs and grpc/mocks or grpc/protos while creating a backup
   * Copy mocks directory, grpc/mocks and grpc/protos directories, certs directory and config file to backup
   * folder in users' home directory
   */
  private createBackup = (enableHttps: boolean, enableHttp2: boolean, enablegRPC: boolean, enableWs: boolean) => {
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
    if (enableWs) {
      fse.copySync(path.resolve(this.wsMocksDir), path.join(os.homedir(), ".camouflage_backup", "ws_mocks"));
    }
    fse.copySync(path.resolve(this.configFilePath), path.join(os.homedir(), ".camouflage_backup", this.configFileName));
    logger.debug("Finished creating a new back up.");
  };
}
