import { Then } from "@cucumber/cucumber";
import { assert } from "chai";
import moment from "moment";

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

Then('the {string} property has a {string} value of format {string}', function (propName: string, propType: string, format: string) {
  assert.typeOf(this.response[propName], propType);
  assert.isTrue(moment(this.response[propName], format, true).isValid())
});

Then('the {string} property has a {string} value of {string}', function (propName: string, propType: string, propValue: string) {
  assert.typeOf(this.response[propName], propType);
  assert.equal(this.response[propName], propValue);
});

Then('the {string} property has a {string} value between {int} and {int}', function (propName: string, propType: string, lower: number, upper: number) {
  assert.typeOf(this.response[propName], propType);
  assert.isAbove(this.response[propName], lower);
  assert.isBelow(this.response[propName], upper);
})

Then('the response is an array of length {int}', function (length: number) {
  assert(Array.isArray(this.response), 'not an array')
  assert.equal(this.response.length, length)
})

Then('the {string} header has a value of {string}', function (headerKey: string, headerValue: string) {
  assert.equal(this.headers[headerKey.toLowerCase()], headerValue)
})
