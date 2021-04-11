import express from "express";
import bodyParser from "body-parser";
import "./handlebar/helperInit";
import getFilePath from "./parser/determineMockFile";
import getResponse from "./parser/generateResponse";
let mocksDir = "";
let port = 8080;
const app = express();
app.use(bodyParser.json());

function start(inputMocksDir: string, inputPort: number) {
  mocksDir = inputMocksDir;
  port = inputPort;
  app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./public" });
  });

  app.get("*", (req, res) => {
    const mockFile = getFilePath(req, mocksDir) + "/GET.mock";
    getResponse(mockFile, req, res);
  });

  app.post("*", (req, res) => {
    const mockFile = getFilePath(req, mocksDir) + "/POST.mock";
    getResponse(mockFile, req, res);
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}

module.exports.start = start;

