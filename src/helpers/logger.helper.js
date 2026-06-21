import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "logs", "app.log");

export const logger = {
  info: (message, data = {}) => {
    const log = `[INFO] ${new Date().toISOString()} ${message} ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFile, log);
  },

  error: (message, error = {}) => {
    const log = `[ERROR] ${new Date().toISOString()} ${message} ${error?.stack || error}\n`;
    fs.appendFileSync(logFile, log);
  },

  warn: (message, data = {}) => {
    const log = `[WARN] ${new Date().toISOString()} ${message} ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFile, log);
  }
};