import * as scheduler from "node-cron";
import path from "path";
import os from "os";
import * as fse from "fs-extra";
import logger from "../logger";
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";
/**
 * Define a schedule and implementation for backup using config.backup.cron
 */
export default class BackupScheduler {
  private config: CamouflageConfig;
  private configFilePath: string;
  private configFileName: string;
  constructor(configFilePath: string) {
    this.config = getLoaderInstance().getConfig();
    this.configFilePath = configFilePath;
    this.configFileName = configFilePath.split(path.sep).slice(-1)[0];
  }
  /**
   *
   * Create an initial back up while starting the application.
   * Schedule further backup as specified by cron schedule in config
   */
  schedule = () => {
    this.createBackup();
    scheduler.schedule(this.config.backup.cron, () => {
      this.createBackup();
    });
    logger.info(`Scheduled a backup cron job with specified cron: ${this.config.backup.cron}`);
  };
  /**
   * If following protocols are not enabled, camouflage will not look for directories specific to these protocols,
   * such as certs and grpc/mocks or grpc/protos while creating a backup
   * Copy mocks directory, grpc/mocks and grpc/protos directories, certs directory and config file to backup
   * folder in users' home directory
   */
  private createBackup = () => {
    logger.debug("Creating a new back up.");
    if (this.config.protocols.http.enable || this.config.protocols.https.enable || this.config.protocols.http2.enable) {
      fse.copySync(path.resolve(this.config.protocols.http.mocks_dir), path.join(os.homedir(), ".camouflage_backup", "mocks"));
    }
    if (this.config.protocols.grpc.enable) {
      fse.copySync(path.resolve(this.config.protocols.grpc.mocks_dir), path.join(os.homedir(), ".camouflage_backup", "grpc", "mocks"));
      fse.copySync(path.resolve(this.config.protocols.grpc.protos_dir), path.join(os.homedir(), ".camouflage_backup", "grpc", "protos"));
    }
    if (this.config.protocols.http2.enable || this.config.protocols.https.enable) {
      fse.copySync(path.resolve(this.config.ssl.key), path.join(os.homedir(), ".camouflage_backup", "certs", "server.key"));
      fse.copySync(path.resolve(this.config.ssl.cert), path.join(os.homedir(), ".camouflage_backup", "certs", "server.cert"));
    }
    if (this.config.protocols.ws.enable) {
      fse.copySync(path.resolve(this.config.protocols.ws.mocks_dir), path.join(os.homedir(), ".camouflage_backup", "ws_mocks"));
    }
    fse.copySync(path.resolve(this.configFilePath), path.join(os.homedir(), ".camouflage_backup", this.configFileName));
    logger.debug("Finished creating a new back up.");
  };
}
