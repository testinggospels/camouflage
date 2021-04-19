import winston from "winston";
const loglevel = "info";

export const setLogLevel = (loglevel: string) => {
  logger.level = loglevel;
};

const logger = winston.createLogger({
  level: loglevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((log) => `${log.timestamp} ${log.level}: ${log.message}` + (log.splat !== undefined ? `${log.splat}` : " "))
  ),
  transports: [new winston.transports.Console()],
});

export default logger;

