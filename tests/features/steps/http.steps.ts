import { Given, When } from "@cucumber/cucumber";
import axios from "axios";
import { ensureDirSync, writeFileSync } from "fs-extra";
import { getLoaderInstance } from "../../../src/ConfigLoader";

Given("a http mock file for {string}", function (url: string, file: string) {
  this.httpConfig = getLoaderInstance().getConfig().protocols.http;
  ensureDirSync(`${this.httpConfig.mocks_dir}${url}`);
  writeFileSync(`${this.httpConfig.mocks_dir}${url}/GET.mock`, file);
});

When("the http url {string} is called", async function (url: string) {
  this.httpConfig = getLoaderInstance().getConfig().protocols.http;
  const { data } = await axios.get(
    `http://localhost:${this.httpConfig.port}/${url}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  this.response = data;
});
