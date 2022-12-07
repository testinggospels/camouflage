import { AfterAll, BeforeAll } from "@cucumber/cucumber";
import { remove } from "fs-extra";
import ConfigLoader, { setLoaderInstance, getLoaderInstance } from "../../../src/ConfigLoader";

BeforeAll(function () {
    const configLoader: ConfigLoader = new ConfigLoader("./tests/config.yml");
    configLoader.validateAndLoad();
    setLoaderInstance(configLoader);
})
AfterAll(function () {
    remove(getLoaderInstance().getConfig().protocols.http.mocks_dir);
})