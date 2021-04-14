import Handlebars from "handlebars";
import moment from "moment";
import express from "express";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import jsonpath from "jsonpath";

export class HandlerBarHelper {
  nowHelper = () => {
    Handlebars.registerHelper("now", (context) => {
      const format = typeof context.hash.format === "undefined" ? "YYYY-MM-DD hh:mm:ss" : context.hash.format;
      let offsetUnit: moment.unitOfTime.DurationConstructor = "s";
      let offsetAmount: number = 0;
      if (typeof context.hash.offset !== "undefined") {
        let offset = context.hash.offset.split(" ");
        offsetAmount = <number>offset[0];
        offsetUnit = <moment.unitOfTime.DurationConstructor>offset[1];
      }
      switch (format) {
        case "epoch":
          return moment().add(offsetAmount, offsetUnit).format("x");
        case "unix":
          return moment().add(offsetAmount, offsetUnit).format("X");
        default:
          return moment().add(offsetAmount, offsetUnit).format(format);
      }
    });
  };

  randomValueHelper = () => {
    Handlebars.registerHelper("randomValue", (context) => {
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
    Handlebars.registerHelper("capture", (context) => {
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

  delayHelper = () => {
    Handlebars.registerHelper("delay", (context) => {
      if (typeof context.hash.lower === "undefined" || typeof context.hash.upper === "undefined") {
        console.error("lower or upper value not specified.");
        return 0;
      } else {
        const lower = parseInt(context.hash.lower);
        const upper = parseInt(context.hash.upper);
        if (lower > upper) {
          console.error("lower value cannot be greater than upper value.");
          return 0;
        }
        const delay = Math.floor(Math.random() * (upper - lower + 1) + lower);
        return delay;
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

