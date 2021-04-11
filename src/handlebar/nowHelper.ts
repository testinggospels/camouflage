import Handlebars from "handlebars";
import moment from "moment";
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
