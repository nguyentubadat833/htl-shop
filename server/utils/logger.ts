import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import os from "os";
import path from "path";

const tmpDir = os.tmpdir();

const transport = new DailyRotateFile({
  //   dirname: "logs",
  dirname: path.join(tmpDir, 'logs'),
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
});

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`),
  ),
  transports: [new winston.transports.Console(), transport],
});
