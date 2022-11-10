import { Request } from "express";
import SwaggerParser from "@apidevtools/swagger-parser";
import OpenAPIRequestValidator from "openapi-request-validator";
import OpenAPIResponseValidator from "openapi-response-validator";
import createHttpError from "http-errors";
import type { OpenAPI } from "openapi-types";

import logger from "../logger";
import { ValidationAdapter, ValidationResult } from "./ValidationAdapter";
import type { HttpParserResponse } from "../parser/HttpParser";

export default class OpenApiAdapter extends ValidationAdapter {
  private document: OpenAPI.Document;

  private findRoute(req: Request) {
    const { paths } = this.document;
    const route = Object.entries(paths).find(([p, v]) => {
      const expressPath = this.expressifyPath(p);
      v.url = p; // assign the url
      const url = req.url.split("?")[0];
      return (
        expressPath === req.route.path ||
        expressPath === url ||
        expressPath.slice(0, -1) === url ||
        expressPath === url.slice(0, -1) ||
        this.urlMatchesParsedRoute(expressPath, url)
      );
    });
    return route && route[1];
  }

  private urlMatchesParsedRoute(route: string, url: string) {
    const routeParts = this.getParts(route);
    const urlParts = this.getParts(url);
    const parsedRoute = routeParts.map((part: string, x: number) => {
      if (part.startsWith(":")) {
        return urlParts[x];
      }
      return part;
    });
    const parsedUrl = `/${parsedRoute.join("/")}`;
    if (parsedUrl === url) {
      return true;
    }
    return false;
  }

  private extractPathParamsFromRequest(req: Request) {
    const currentRoute = this.findRoute(req);
    const routeParts = this.getParts(this.expressifyPath(currentRoute.url));
    const urlParts = this.getParts(req.url.split("?")[0]);
    const pathParams: { [k: string]: string } = {};
    routeParts.forEach((part: string, x: number) => {
      if (part.startsWith(":")) {
        pathParams[part.slice(1)] = urlParts[x];
      }
    });
    return pathParams;
  }

  private expressifyPath(path: string) {
    /* eslint-disable */
    const params = path.match(/(\{(?:\{.*\}|[^\{])*\})/g);
    /* eslint-enable */
    if (params?.length > 0) {
      for (let x = 0; x < params.length; x++) {
        const param = params[x];
        path = path.replace(param, param.replace("{", ":").replace("}", ""));
      }
    }
    return path;
  }

  private getParts(url: string) {
    const parts = url.split("/");
    parts.shift();
    return parts;
  }

  async load(): Promise<void> {
    const parser = new SwaggerParser();
    try {
      this.document = await parser.dereference(this.config.url);
      logger.info(
        `OpenApi ${this.document.info.title} (v${this.document.info.version}) validation schema loaded from ${this.config.url}.`
      );
    } catch (error) {
      logger.error(
        `Couldn't load OpenApi validation schema ${this.config.url}, because: ${error.message}`
      );
    }
  }

  supportsRequest(req: Request): boolean {
    return this.findRoute(req) ? true : false;
  }

  verifyRequest(req: Request) {
    const method = req.method.toLowerCase();
    const currentRoute = this.findRoute(req);

    if (currentRoute && currentRoute[method]) {
      // check required params
      const requestValidator = new OpenAPIRequestValidator(
        currentRoute[method]
      );

      req.params = this.extractPathParamsFromRequest(req);

      const result = requestValidator.validateRequest(req);

      if (result?.errors.length > 0) {
        const error = new createHttpError.BadRequest(
          JSON.stringify(result.errors, null, 2)
        );
        return {
          valid: false,
          error,
        };
      }

      const queryParams: any[] = [];
      const parameters = currentRoute[method]?.parameters;
      parameters.forEach((parameter: any) => {
        if (parameter.in === "query") {
          queryParams.push(parameter);
        }
      });

      for (let x = 0; x < Object.keys(req.query).length; x++) {
        const k = Object.keys(req.query)[x];
        const param = queryParams.find((p) => p.name === k);
        if (!param) {
          const error = new createHttpError.BadRequest(
            JSON.stringify(
              [
                {
                  path: "page",
                  errorCode: "type.openapi.requestValidation",
                  message: `unknown query parameter '${k}'`,
                  location: "query",
                },
              ],
              null,
              2
            )
          );
          return {
            valid: false,
            error,
          };
        }
      }
    }

    return {
      valid: true,
    };
  }

  verifyResponse(req: Request, response: HttpParserResponse): ValidationResult {
    const method = req.method.toLowerCase();
    const currentRoute = this.findRoute(req);

    if (currentRoute && currentRoute[method]) {
      try {
        // check response
        const responseValidator = new OpenAPIResponseValidator(
          currentRoute[method]
        );

        const result = responseValidator.validateResponse(
          response.status,
          JSON.parse(response.body)
        );

        if (result?.errors.length > 0) {
          const error = createHttpError(
            409,
            new Error(JSON.stringify(result.errors, null, 2))
          );
          return {
            valid: false,
            error,
          };
        }
      } catch (err) {
        const error = new createHttpError[500](
          JSON.stringify(
            [
              {
                path: "schema",
                errorCode: "type.openapi.error",
                message: err.message,
                location: "schema",
              },
            ],
            null,
            2
          )
        );
        return {
          valid: false,
          error,
        };
      }
    }

    return {
      valid: true,
    };
  }
}
