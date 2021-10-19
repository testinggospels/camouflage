import express from "express";
import logger from "../logger";
const { Pool } = require('pg')
const pool = new Pool({
    user: 'root',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432,
})

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
                logger.error("No query defined")
                return JSON.stringify({ error: "Please Define a query" });
            }
            const query = context.hash.query;
            /* eslint-disable no-unused-vars */
            const request: express.Request = context.data.root.request;
            logger.debug("[POSTGRES] Recieved query:", query)
            try {
                const result = await pool.query(query)
                logger.debug("[POSTGRES] Query response:", result.rows)
                const fn = await context.fn(this)
                const output = eval(fn);
                return output;
            } catch (err) {
                logger.error("Query could not be executed", err);
                return JSON.stringify({
                    error: "Query could not be executed",
                    message: err.message
                })
            }
        });
    };
}