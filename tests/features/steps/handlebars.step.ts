import { Then } from "@cucumber/cucumber";
import { assert } from "chai";

Then(
  "the {string} property has a {string} value of {int} characters",
  function (propName: string, propType: string, countCharacters: number) {
    assert.typeOf(this.response[propName], propType);
    assert.lengthOf(
      this.response[propName].length
        ? this.response[propName]
        : this.response[propName].toString(),
      countCharacters
    );
  }
);
