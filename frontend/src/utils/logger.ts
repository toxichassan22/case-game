/**
 * Centralized Logger for the game.
 * Automatically suppresses logs in production mode.
 */

const IS_PROD = import.meta.env.PROD;

export const Logger = {
  log: (...args: any[]) => {
    if (!IS_PROD) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!IS_PROD) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // We might want to always log errors or send them to an error reporting service
    if (!IS_PROD) {
      console.error(...args);
    } else {
      // In production, we log a minimal error message without potentially sensitive payload data
      const safeArgs = args.map(arg => {
        if (arg instanceof Error) return arg.message;
        if (typeof arg === 'string') return arg;
        return '[Object/Data Hidden in Prod]';
      });
      console.error('[App Error]:', ...safeArgs);
    }
  },
  info: (...args: any[]) => {
    if (!IS_PROD) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (!IS_PROD) {
      console.debug(...args);
    }
  }
};
