/**
 * Centralized Logging System for Runtime Engine
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  timestamp: number;
  context: string;
  message: string;
  data?: unknown;
}

class EngineLogger {
  private logs: LogEntry[] = [];
  private readonly maxLogs: number;
  private readonly isProduction: boolean;

  constructor(maxLogs: number = 1000, isProduction: boolean = false) {
    this.maxLogs = maxLogs;
    this.isProduction = isProduction;
  }

  debug(context: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, context, message, data);
  }

  private log(level: LogLevel, context: string, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      timestamp: Date.now(),
      context,
      message,
      data,
    };

    // Store in memory (circular buffer)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output (respect production mode)
    if (!this.isProduction || level >= LogLevel.WARN) {
      const prefix = `[Engine:${context}]`;
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data ?? '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data ?? '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data ?? '');
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data ?? '');
          break;
      }
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter((entry) => entry.level >= level);
  }

  clear(): void {
    this.logs = [];
  }

  getErrorCount(): number {
    return this.logs.filter((entry) => entry.level === LogLevel.ERROR).length;
  }

  getWarningCount(): number {
    return this.logs.filter((entry) => entry.level === LogLevel.WARN).length;
  }
}

// Singleton instance
export const engineLogger = new EngineLogger(
  1000,
  process.env.NODE_ENV === 'production'
);
