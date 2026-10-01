/**
 * Application Logger
 * Structured logging with different levels and outputs
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

export class Logger {
  private level: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(level: LogLevel = LogLevel.INFO, maxLogs: number = 1000) {
    this.level = level;
    this.maxLogs = maxLogs;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const logContext = context || {};
    
    if (error instanceof Error) {
      logContext.stack = error.stack;
      logContext.errorName = error.name;
      logContext.errorMessage = error.message;
    } else if (error) {
      logContext.error = error;
    }

    this.log(LogLevel.ERROR, message, logContext);
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (level < this.level) return;

    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: levelNames[level],
      message,
      context,
      stack: context?.stack,
    };

    // Store log
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console
    this.outputToConsole(entry);
  }

  /**
   * Output log to console
   */
  private outputToConsole(entry: LogEntry) {
    const logMessage = `[${entry.timestamp}] [${entry.levelName}] ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.context || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.context || '');
        break;
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs to JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel) {
    this.level = level;
  }
}

// Singleton instance
export const logger = new Logger(
  process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
);
