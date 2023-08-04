import { BeforeAll } from "@cucumber/cucumber";
import ConfigLoader, { setLoaderInstance } from "../../../src/ConfigLoader";

BeforeAll(function() {
    const configLoader: ConfigLoader = new ConfigLoader("./tests/config.yml");
    configLoader.validateAndLoad();
    setLoaderInstance(configLoader);
})