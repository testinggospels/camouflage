import { CamouflageConfig } from "./LoaderInterface";
import yaml from 'js-yaml';
import fs from 'fs';

let loaderInstance: ConfigLoader;

export default class ConfigLoader {
    private config: CamouflageConfig;
    constructor(configFile: string) {
        this.config = yaml.load(fs.readFileSync(configFile, "utf-8")) as CamouflageConfig;
    }

    getConfig(): CamouflageConfig {
        return this.config;
    }

    validateAndLoad = (): CamouflageConfig => {
        // Check and set default values if a config is missing.
        this.config.loglevel = this.config.loglevel ? this.config.loglevel : 'info';
        this.config.cpus = this.config.cpus ? this.config.cpus : 1;
        this.config.monitoring = this.config.monitoring ? this.config.monitoring : { port: 5555 };
        this.config.ssl = this.config.ssl ? this.config.ssl : { cert: null, key: null, root_cert: null };
        this.config.protocols.http = this.config.protocols.http ? this.config.protocols.http : {
            enable: true,
            mocks_dir: "./mocks",
            port: 8080
        };
        this.config.protocols.https = this.config.protocols.https ? this.config.protocols.https : {
            enable: false,
            port: 8443
        };
        this.config.protocols.http2 = this.config.protocols.http2 ? this.config.protocols.http2 : { enable: false, port: 8081 };
        this.config.protocols.ws = this.config.protocols.ws ? this.config.protocols.ws : {
            enable: false,
            port: 8082,
            mocks_dir: "./ws_mocks"
        };
        this.config.protocols.grpc = this.config.protocols.grpc ? this.config.protocols.grpc : {
            enable: false,
            host: "localhost",
            port: 4312,
            mocks_dir: "./grpc/mocks",
            protos_dir: "./grpc/protos",
            grpc_tls: false,
        };
        this.config.protocols.thrift = this.config.protocols.thrift ? this.config.protocols.thrift : {
            enable: false,
            mocks_dir: "./thrift/mocks",
            services: []
        };
        this.config.backup = this.config.backup ? this.config.backup : { enable: false, cron: "0 * * * *" };
        this.config.cache = this.config.cache ? this.config.cache : { enable: false, ttl_seconds: 300 };
        this.config.injection = this.config.injection ? this.config.injection : { enable: false };
        this.config.ext_helpers = this.config.ext_helpers ? this.config.ext_helpers : null;
        this.config.origins = this.config.origins ? this.config.origins : []
        return this.config
    }

    setConfig(config: CamouflageConfig): CamouflageConfig {
        this.config = config;
        return this.config
    }
}

export const setLoaderInstance = (loader: ConfigLoader): ConfigLoader => {
    loaderInstance = loader;
    return loaderInstance;
}
export const getLoaderInstance = (): ConfigLoader => loaderInstance