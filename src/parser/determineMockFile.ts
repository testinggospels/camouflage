import express from "express";
import path from "path";
import fs from "fs";
// @ts-ignore
import yaml from "js-yaml";
const config = yaml.load(fs.readFileSync("/Users/user/Documents/misc/node/camouflage/config.yml", "utf-8"));
const mockDir = config.MOCKS_DIR;

export default function getFilePath(req: express.Request) {
  const reqDetails = {
    method: req.method.toUpperCase(),
    path: req.path,
    protocol: req.protocol,
    httpVersion: req.httpVersion,
    query: req.query,
    headers: req.headers,
    body: req.body,
  };
  const matchedDir = getWildcardPath(reqDetails.path);
  return matchedDir;
}

function removeBlanks(array: Array<any>) {
  return array.filter(function (i) {
    return i;
  });
}

function getWildcardPath(dir: string) {
  let steps = removeBlanks(dir.split("/"));
  let testPath;
  let newPath = path.join(mockDir, steps.join("/"));
  let exists = false;

  while (steps.length) {
    steps.pop();
    testPath = path.join(mockDir, steps.join("/"), "__");
    exists = fs.existsSync(testPath);
    if (exists) {
      newPath = testPath;
      break;
    }
  }
  return newPath;
}
