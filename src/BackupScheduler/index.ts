// @ts-ignore
import * as scheduler from "node-cron";
import path from "path";
import os from "os";
// @ts-ignore
import * as fse from "fs-extra";
import logger from "../logger";
/**
 * Define a schedule and implementation for backup using config.backup.cron
 */
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
  /**
   *
   * @param {string} cron cron schedule
   * @param {string} mocksDir location of http mockdir to be backed up
   * @param {string} grpcMocksDir location of grpc mockdir to be backed up
   * @param {string} grpcProtosDir location of grpc protos dir to be backed up
   * @param {string} wsMocksDir location of ws mockdir to be backed up
   * @param {string} key location of server.key to be backed up
   * @param {string} cert location of server.cert to be backed up
   * @param {string} configFilePath location of config file to be backed up
   */
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
   *
   * Create an initial back up while starting the application.
   * Schedule further backup as specified by cron schedule in config
   * @param {boolean} enableHttps Indicates whether HTTPs is enabled/disabled
   * @param {boolean} enableHttp2 Indicates whether HTTP2 is enabled/disabled
   * @param {boolean} enablegRPC Indicates whether gRPC is enabled/disabled
   * @param {boolean} enableWs Indicates whether Websocket is enabled/disabled
   */
  schedule = (enableHttps: boolean, enableHttp2: boolean, enablegRPC: boolean, enableWs: boolean) => {
    this.createBackup(enableHttps, enableHttp2, enablegRPC, enableWs);
    scheduler.schedule(this.cron, () => {
      this.createBackup(enableHttps, enableHttp2, enablegRPC, enableWs);
    });
    logger.info(`Scheduled a backup cron job with specified cron: ${this.cron}`);
  };
  /**
   * If following protocols are not enabled, camouflage will not look for directories specific to these protocols,
   * such as certs and grpc/mocks or grpc/protos while creating a backup
   * Copy mocks directory, grpc/mocks and grpc/protos directories, certs directory and config file to backup
   * folder in users' home directory
   * @param {boolean} enableHttps Indicates whether HTTPs is enabled/disabled
   * @param {boolean} enableHttp2 Indicates whether HTTP2 is enabled/disabled
   * @param {boolean} enablegRPC Indicates whether gRPC is enabled/disabled
   * @param {boolean} enableWs Indicates whether Websocket is enabled/disabled
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
