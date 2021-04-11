import express from "express";
import Handlebars from "handlebars";
// @ts-ignore
import jsonpath from "jsonpath";

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
