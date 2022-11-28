import { ensureDirSync, writeFileSync } from "fs-extra";

export const httpMockDir = "tests/.tmp/mocks";
ensureDirSync(httpMockDir);
writeFileSync(`${httpMockDir}/HEAD.mock`, "HTTP/1.1 200 OK")