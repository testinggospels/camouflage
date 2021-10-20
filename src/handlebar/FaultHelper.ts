import logger from "../logger";
import express from "express";
/**
 * Defines and registers custom handlebar helper - code
 */
export class FaultHelper {
    private Handlebars: any;
    constructor(Handlebars: any) {
        this.Handlebars = Handlebars
    }
    /**
     * Registers code helper
     * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
     * - If file path is passed, check if file exists and send the return value to HttpParser to process
     * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
     * @returns {void}
     */
    register = () => {
        this.Handlebars.registerHelper("fault", (context: any) => {
            const response = `{"CamouflageResponseType": "fault", "FaultType": "${context.hash.type}"}`;
            return response;
        });
    };
}
