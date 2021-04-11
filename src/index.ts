import express from "express";
import bodyParser from "body-parser";
import "./handlebar/helperInit";
import getFilePath from "./parser/determineMockFile";
import getResponse from "./parser/generateResponse";
import fs from "fs";
// @ts-ignore
import yaml from "js-yaml";
const config = yaml.load(fs.readFileSync("/Users/user/Documents/misc/node/camouflage/config.yml", "utf-8"));
const port = config.PORT;
const app = express();
app.use(bodyParser.json());

app.get("*", (req, res) => {
  const mockFile = getFilePath(req) + "/GET.mock";
  getResponse(mockFile, req, res);
});

app.post("*", (req, res) => {
  const mockFile = getFilePath(req) + "/POST.mock";
  getResponse(mockFile, req, res);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
