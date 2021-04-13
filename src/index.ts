import express from "express";
import bodyParser from "body-parser";
import "./handlebar/helperInit";
import { Parser } from "./parser/parserDefinition";
let mocksDir = "";
let port = 8080;
const app = express();
app.use(bodyParser.json());

function start(inputMocksDir: string, inputPort: number) {
  mocksDir = inputMocksDir;
  port = inputPort;
  app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: "./public" });
  });

  app.get("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getFilePath() + "/GET.mock";
    parser.getResponse(mockFile);
  });

  app.post("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getFilePath() + "/POST.mock";
    parser.getResponse(mockFile);
  });

  app.put("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getFilePath() + "/PUT.mock";
    parser.getResponse(mockFile);
  });

  app.delete("*", (req: express.Request, res: express.Response) => {
    const parser = new Parser(req, res, mocksDir);
    const mockFile = parser.getFilePath() + "/DELETE.mock";
    parser.getResponse(mockFile);
  });

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}

module.exports.start = start;

