import { Request } from "express";
import SwaggerParser from "@apidevtools/swagger-parser";
import OpenAPIRequestValidator from "openapi-request-validator";
import OpenAPIResponseValidator from "openapi-response-validator";
import createHttpError from "http-errors";
import type { OpenAPI } from "openapi-types";

import logger from "../logger";
import { ValidationAdapter, ValidationResult } from "./ValidationAdapter";
import type { HttpParserResponse } from "../parser/HttpParser";

const expressifyPath = (path: string) => {
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
};

export default class OpenApiAdapter extends ValidationAdapter {
  private document: OpenAPI.Document;

  private findRoute(req: Request) {
    const { paths } = this.document;
    const route = Object.entries(paths).find(([p]) => {
      const expressPath = expressifyPath(p);
      const url = req.url.split("?")[0];
      return (
        expressPath === req.route.path ||
        expressPath === url ||
        expressPath.slice(0, -1) === url ||
        expressPath === url.slice(0, -1)
      );
    });
    return route && route[1];
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
    }

    return {
      valid: true,
    };
  }
}
