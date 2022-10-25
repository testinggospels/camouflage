import logger from "../logger";
import GrpcParser from "../parser/GrpcParser";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import fs from "fs";
import path from "path";
import jp from 'jsonpath';
import { CamouflageConfig } from "../ConfigLoader/LoaderInterface";
import { getLoaderInstance } from "../ConfigLoader";
const availableFiles: string[] = [];

export default class GrpcSetup {
    private config: CamouflageConfig;
    constructor() {
        this.config = getLoaderInstance().getConfig()
    }
    /**
   * Initializes a gRPC server at specified host and port
   * - Set location of gRPC mocks to be used by metod camouflageMock
   * - Get an array of all .protofile in specified protos directory
   * - Run forEach on the array and read and load package definition for each protofile in protos dir
   * - For each definition, get the package details from all .proto files and store in a master packages object
   * - Initialize a grpcServer
   * - Create an insecure binding to given grpc host and port, and start the server
   * - For each package, filter out objects with service definition, discard rest
   * - For each method in the service definition, attach a generic handler, finally add service to running server
   * - Handlers will vary based on the type of request, i.e. unary, bidi streams or one sided streams
   * - Finally add all services to the server
   * @param {string[]} protoIgnore array of protofiles to be ingored (used for the protofiles which are imported and have services)
   * @param {PLConfig} plconfig configuration for protoLoader
   */
    initGrpc = (protoIgnore: string[], plconfig: PLConfig) => {
        let availableProtoFiles: string[];
        if (plconfig.includeProtos) {
            availableProtoFiles = plconfig.includeProtos.map((protos: string) => {
                const resolvedProto = path.resolve(protos);
                logger.debug(`Found protofile: ${resolvedProto}`)
                return resolvedProto;
            });
            delete plconfig.includeProtos;
        } else {
            availableProtoFiles = fromDir(this.config.protocols.grpc.protos_dir, ".proto", protoIgnore);
        }
        logger.debug(`Using proto-loader config as: ${JSON.stringify(plconfig)}`);
        logger.debug(`Ignoring protofiles: ${protoIgnore}`);
        const grpcParser: GrpcParser = new GrpcParser();
        const grpcObjects: grpc.GrpcObject[] = [];
        const packages: any = [];
        availableProtoFiles.forEach((availableProtoFile) => {
            const packageDef = protoLoader.loadSync(path.resolve(availableProtoFile), plconfig);
            const definition = grpc.loadPackageDefinition(packageDef);
            grpcObjects.push(definition);
        });
        grpcObjects.forEach((grpcObject: grpc.GrpcObject) => {
            Object.keys(grpcObject).forEach((availablePackage) => {
                packages.push(grpcObject[`${availablePackage}`]);
            });
        });
        const server = new grpc.Server();
        server.bindAsync(`${this.config.protocols.grpc.host}:${this.config.protocols.grpc.port}`, serverCredentials(this.config.protocols.grpc.grpc_tls, this.config.ssl.cert, this.config.ssl.key, this.config.ssl.root_cert), (err) => {
            if (err) logger.error(err.message);
            logger.info(`Worker sharing gRPC server at ${this.config.protocols.grpc.host}:${this.config.protocols.grpc.port} ⛳`);
            server.start();
        });
        const services: any[] = jp.query(packages, "$..service");
        services.forEach((service) => {
            const methods = Object.keys(service);
            methods.forEach((method) => {
                if (!service[method]["responseStream"] && !service[method]["requestStream"]) {
                    if (server.register(service[method]["path"], grpcParser.camouflageMock, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'unary')) {
                        logger.debug(`Registering Unary method: ${method}`);
                    } else {
                        logger.warn(`Not re-registering ${method}. Already registered.`)
                    }
                }
                if (service[method]["responseStream"] && !service[method]["requestStream"]) {
                    if (server.register(service[method]["path"], grpcParser.camouflageMockServerStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'serverStream')) {
                        logger.debug(`Registering method with server side streaming: ${method}`);
                    } else {
                        logger.warn(`Not re-registering ${method}. Already registered.`)
                    }
                }
                if (!service[method]["responseStream"] && service[method]["requestStream"]) {
                    if (server.register(service[method]["path"], grpcParser.camouflageMockClientStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'clientStream')) {
                        logger.debug(`Registering method with client side streaming: ${method}`);
                    } else {
                        logger.warn(`Not re-registering ${method}. Already registered.`)
                    }
                }
                if (service[method]["responseStream"] && service[method]["requestStream"]) {
                    if (server.register(service[method]["path"], grpcParser.camouflageMockBidiStream, service[method]["responseSerialize"], service[method]["requestDeserialize"], 'bidi')) {
                        logger.debug(`Registering method with BIDI streaming: ${method}`);
                    } else {
                        logger.warn(`Not re-registering ${method}. Already registered.`)
                    }
                }
            });
        });
    };
}
const fromDir = function (startPath: string, filter: string, protoIgnore: string[]) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter, protoIgnore);
        }
        else if (filename.indexOf(filter) >= 0 && !protoIgnore.includes(path.resolve(filename))) {
            const protoFile = path.resolve(filename)
            logger.debug(`Found protofile: ${protoFile}`)
            availableFiles.push(protoFile)
        }
    }
    return availableFiles;
}

const serverCredentials = function (enableTls: boolean, certPath: string, keyPath: string, rootCert?: string): grpc.ServerCredentials {
    if (!enableTls) {
        logger.debug(`Using insecure gRPC server credentials.`);
        return grpc.ServerCredentials.createInsecure()
    }
    const keyCertPairs = [{
        private_key: fs.readFileSync(keyPath),
        cert_chain: fs.readFileSync(certPath)
    }]
    if (fs.existsSync(rootCert)) {
        logger.debug(`Using SSL gRPC server credentials with client authentication.`);
        return grpc.ServerCredentials.createSsl(fs.readFileSync(rootCert), keyCertPairs, true)
    } else {
        logger.debug(`Using SSL gRPC server credentials without client authentication.`);
        return grpc.ServerCredentials.createSsl(null, keyCertPairs, false);
    }
}

interface PLConfig extends protoLoader.Options {
    includeProtos?: string[];
}