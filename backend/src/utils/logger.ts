import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console (readable)
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  errors({ stack: true }),
  printf((info) => {
    return `${info.timestamp} [${info.level}]: ${info.message}${
      info.stack ? `\n${info.stack}` : ""
    }`;
  })
);

// Custom format for file (JSON)
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  errors({ stack: true }),
  json()
);

const transports = [
  // Console logging
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: consoleFormat,
  }),
  // Daily rotating file for errors
  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
  }),
  // Daily rotating file for all logs
  new DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels: winston.config.npm.levels,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
