import Handlebars from "handlebars";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

Handlebars.registerHelper("randomValue", function (context) {
  let length = typeof context.hash.length === "undefined" ? 16 : context.hash.length;
  let type = typeof context.hash.type === "undefined" ? "ALPHANUMERIC" : context.hash.type;
  if (context.hash.uppercase && type.includes("ALPHA")) {
    type = type + "_UPPER";
  }
  if (type === "UUID") {
    return uuidv4();
  } else {
    return randomString(length, genCharArray(type));
  }
});

function randomString(length: number, chars: string) {
  var result = "";
  if (typeof chars === "undefined") {
    randomFixedInteger(length);
  } else {
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function genCharArray(type: string) {
  let alphabet;
  let numbers = [...Array(10)].map((x, i) => i);
  switch (type) {
    case "ALPHANUMERIC":
      alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
      return alphabet.join("") + numbers.join("");
    case "ALPHANUMERIC_UPPER":
      alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
      return alphabet.join("") + numbers.join("");
    case "ALPHABETIC":
      alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
      return alphabet.join("");
    case "ALPHABETIC_UPPER":
      alphabet = [...Array(26)].map((x, i) => String.fromCharCode(i + 65));
      return alphabet.join("");
    case "NUMERIC":
      return numbers.join("");
    default:
      break;
  }
}

var randomFixedInteger = function (length: number) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};
