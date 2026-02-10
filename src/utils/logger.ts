interface LogContext {
  [key: string]: unknown;
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  info(event: string, context?: LogContext): void {
    const entry = this.createLogEntry('INFO', event, context);

    if (this.isDevelopment) {
      console.log(`[INFO] ${event}`, context ?? '');
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  warn(event: string, context?: LogContext): void {
    const entry = this.createLogEntry('WARN', event, context);

    if (this.isDevelopment) {
      console.warn(`[WARN] ${event}`, context ?? '');
    } else {
      console.warn(JSON.stringify(entry));
    }
  }

  error(event: string, error: Error | string, context?: LogContext): void {
    const entry = this.createLogEntry('ERROR', event, {
      ...context,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (this.isDevelopment) {
      console.error(`[ERROR] ${event}`, error, context ?? '');
    } else {
      console.error(JSON.stringify(entry));
    }
  }

  private createLogEntry(
    level: LogLevel,
    event: string,
    context?: LogContext
  ): LogContext {
    return {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...context,
    };
  }
}

export const logger = new Logger();
