import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

@Injectable()
export class AppLoggerService implements LoggerService {
  log(message: unknown, context?: string) {
    this.write('INFO', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('ERROR', message, context, trace);
  }

  warn(message: unknown, context?: string) {
    this.write('WARN', message, context);
  }

  debug?(message: unknown, context?: string) {
    this.write('DEBUG', message, context);
  }

  verbose?(message: unknown, context?: string) {
    this.write('TRACE', message, context);
  }

  private write(
    level: LogLevel,
    message: unknown,
    context?: string,
    trace?: string,
  ) {
    const payload: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
    };

    if (context) payload.context = context;
    payload.message = this.format(message);
    if (trace) payload.trace = trace;

    console.log(JSON.stringify(payload));
  }

  private format(message: unknown): unknown {
    if (typeof message === 'string') return message;
    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in (message as Record<string, unknown>)
    ) {
      return message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
