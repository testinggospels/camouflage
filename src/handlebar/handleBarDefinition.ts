import Handlebars from "handlebars";
import moment from "moment";
import express from "express";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import jsonpath from "jsonpath";

export class HandlerBarHelper {
  nowHelper = () => {
    Handlebars.registerHelper("now", function (context) {
      const format = typeof context.hash.format === "undefined" ? "YYYY-MM-DD hh:mm:ss" : context.hash.format;
      switch (format) {
        case "epoch":
          return Math.round(Date.now());
        case "unix":
          return Math.round(Date.now() / 1000);
        default:
          return moment().format(format);
      }
    });
  };

  randomValueHelper = () => {
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
  };

  requestHelper = () => {
    Handlebars.registerHelper("capture", function (context) {
      const request: express.Request = context.data.root.request;
      const from: string = context.hash.from;
      switch (from) {
        case "query":
          return request.query[context.hash.key];
        case "headers":
          return request.headers[context.hash.key];
        case "path":
          if (typeof context.hash.regex === "undefined") {
            return "Please specify a regex with path";
          } else {
            let regex = new RegExp(context.hash.regex);
            if (regex.test(request.path)) {
              return regex.exec(request.path)[1];
            } else {
              return "No match found.";
            }
          }
        case "body":
          if (typeof context.hash.using === "undefined" || typeof context.hash.selector == "undefined") {
            return "Please specify using and selector fields.";
          } else {
            switch (context.hash.using) {
              case "regex":
                const regex = new RegExp(context.hash.selector);
                const body = JSON.stringify(request.body, null, 2);
                if (regex.test(body)) {
                  return regex.exec(body)[1];
                } else {
                  return "No match found.";
                }
              case "jsonpath":
                try {
                  return jsonpath.query(request.body, context.hash.selector);
                } catch {
                  return "some error occuered";
                }
              default:
                return null;
            }
          }
        default:
          return null;
      }
    });
  };
}

const randomString = (length: number, chars: string) => {
  var result = "";
  if (typeof chars === "undefined") {
    randomFixedInteger(length);
  } else {
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const randomFixedInteger = (length: number) => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

const genCharArray = (type: string) => {
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
};

