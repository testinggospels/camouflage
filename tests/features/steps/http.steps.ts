import { Given, When } from "@cucumber/cucumber";
import axios, { AxiosRequestConfig } from "axios";
import { existsSync } from "fs";
import { ensureDirSync, remove, writeFileSync } from "fs-extra";
import { getLoaderInstance } from "../../../src/ConfigLoader";

Given("a http mock file for {string} request to url {string}", function (method: string, url: string, file: string) {
  this.httpConfig = getLoaderInstance().getConfig().protocols.http;
  ensureDirSync(`${this.httpConfig.mocks_dir}${url}`);
  writeFileSync(`${this.httpConfig.mocks_dir}${url}/${method.toUpperCase()}.mock`, file);
});

When("the http url {string} is called with method {string}", async function (url: string, method: string) {
  this.httpConfig = getLoaderInstance().getConfig().protocols.http;
  let config: AxiosRequestConfig = {
    method,
    url: `http://localhost:${this.httpConfig.port}${url}`,
  }
  if (this.requestHeaders) config = { ...config, headers: this.requestHeader }
  if (this.requestBody) config = { ...config, data: this.requestBody }
  const response = await axios(config);
  this.response = response.data;
  this.headers = response.headers;
});

Given('request headers', function (headers: string) {
  if (headers) this.requestHeaders = JSON.parse(headers)
});

Given('the request data', function (body: string) {
  if (body) this.requestBody = JSON.parse(body)
});

Given('no mock file for {string} request to url {string}', function (method: string, url: string) {
  if (existsSync(`${getLoaderInstance().getConfig().protocols.http.mocks_dir}${url}`)) remove(`${getLoaderInstance().getConfig().protocols.http.mocks_dir}${url}`)
})
