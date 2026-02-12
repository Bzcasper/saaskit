// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Centralized Logging System
 * Structured logging with multiple levels and outputs
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private requestId: string | null = null;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setRequestId(id: string) {
    this.requestId = id;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatLogEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.levelName}: ${entry.message}`;

    const contextParts: string[] = [];

    if (entry.requestId) contextParts.push(`requestId=${entry.requestId}`);
    if (entry.userId) contextParts.push(`userId=${entry.userId}`);
    if (entry.ip) contextParts.push(`ip=${entry.ip}`);
    if (entry.path) contextParts.push(`path=${entry.path}`);
    if (entry.method) contextParts.push(`method=${entry.method}`);
    if (entry.statusCode) contextParts.push(`status=${entry.statusCode}`);
    if (entry.duration) contextParts.push(`duration=${entry.duration}ms`);

    const context = contextParts.length > 0
      ? ` {${contextParts.join(", ")}}`
      : "";

    if (entry.error) {
      return `${base}${context}\n  Error: ${entry.error.name}: ${entry.error.message}\n  Stack: ${entry.error.stack}`;
    }

    if (entry.context) {
      return `${base}${context} ${JSON.stringify(entry.context)}`;
    }

    return base + context;
  }

  private writeLog(entry: LogEntry) {
    const formatted = this.formatLogEntry(entry);

    // Console output with appropriate level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(formatted);
        break;
    }

    // TODO: Add file logging, external service logging (e.g., LogRocket, Sentry)
    // For production, implement persistent logging
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      levelName: "DEBUG",
      message,
      context,
      requestId: this.requestId || undefined,
    });
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      levelName: "INFO",
      message,
      context,
      requestId: this.requestId || undefined,
    });
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      levelName: "WARN",
      message,
      context,
      requestId: this.requestId || undefined,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      levelName: "ERROR",
      message,
      context,
      requestId: this.requestId || undefined,
      error: error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : undefined,
    });
  }

  critical(message: string, error?: Error, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.CRITICAL)) return;
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.CRITICAL,
      levelName: "CRITICAL",
      message,
      context,
      requestId: this.requestId || undefined,
      error: error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : undefined,
    });
  }

  // Request logging methods
  logRequest(req: Request, context?: { userId?: string; ip?: string }) {
    this.info("Request received", {
      method: req.method,
      path: new URL(req.url).pathname,
      userAgent: req.headers.get("User-Agent"),
      ...context,
    });
  }

  logResponse(
    req: Request,
    statusCode: number,
    duration: number,
    context?: { userId?: string; ip?: string },
  ) {
    const level = statusCode >= 500
      ? LogLevel.ERROR
      : statusCode >= 400
      ? LogLevel.WARN
      : LogLevel.INFO;

    const message = `Response sent: ${statusCode}`;

    if (level === LogLevel.ERROR) {
      this.error(message, undefined, {
        method: req.method,
        path: new URL(req.url).pathname,
        statusCode,
        duration,
        ...context,
      });
    } else if (level === LogLevel.WARN) {
      this.warn(message, {
        method: req.method,
        path: new URL(req.url).pathname,
        statusCode,
        duration,
        ...context,
      });
    } else {
      this.info(message, {
        method: req.method,
        path: new URL(req.url).pathname,
        statusCode,
        duration,
        ...context,
      });
    }
  }
}

// Global logger instance
export const logger = new Logger(
  Deno.env.get("LOG_LEVEL") === "debug"
    ? LogLevel.DEBUG
    : Deno.env.get("LOG_LEVEL") === "warn"
    ? LogLevel.WARN
    : Deno.env.get("LOG_LEVEL") === "error"
    ? LogLevel.ERROR
    : LogLevel.INFO,
);

// Request ID generator
export function generateRequestId(): string {
  return crypto.randomUUID();
}
