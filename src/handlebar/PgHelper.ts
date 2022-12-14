import express from "express";
import log from "../logger";
import { Pool } from 'pg';
const pool = new Pool()

/**
 * Defines and registers custom handlebar helper - pg
 */
export class PgHelper {
    private Handlebars: any;
    constructor(Handlebars: any) {
        this.Handlebars = Handlebars
    }

    /**
     * Registers pg helper
     * - 
     * - 
     * @returns {void}
     */
    register = () => {
        this.Handlebars.registerHelper("pg", async (context: any) => {
            if (typeof context.hash.query === "undefined") {
                log.error("No query defined")
                return JSON.stringify({ error: "Please Define a query" });
            }
            const query = context.hash.query;
            /* eslint-disable no-unused-vars */
            const request: express.Request = context.data.root.request;
            const logger = log;
            /* eslint-disable no-unused-vars */
            log.debug(`[POSTGRES] Recieved query: ${query}`)
            try {
                const result = await pool.query(query)
                log.debug(`[POSTGRES] Query response: ${JSON.stringify(result.rows)}`)
                const fn = await context.fn(this)
                const code = eval(fn);
                code["CamouflageResponseType"] = "code";
                return JSON.stringify(code);
            } catch (err) {
                log.error("Query could not be executed", err);
                return JSON.stringify({
                    error: "Query could not be executed",
                    message: err.message
                })
            }
        });
    };
}