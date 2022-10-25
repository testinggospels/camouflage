import { Request } from "express";

import { HttpParserResponse } from "../parser/HttpParser";
import { ValidationSchema } from "../ConfigLoader/LoaderInterface";

export interface ValidationResult {
  valid: boolean;
  error?: Error;
}

export abstract class ValidationAdapter {
  config: ValidationSchema;

  constructor(config: ValidationSchema) {
    this.config = config;
    this.load();
  }

  abstract load(): Promise<void>;

  abstract supportsRequest(req: Request): boolean;

  abstract verifyRequest(req: Request): ValidationResult;

  abstract verifyResponse(
    req: Request,
    response: HttpParserResponse
  ): ValidationResult;
}
