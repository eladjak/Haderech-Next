type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Logger utility for structured logging across the application
 *
 * Provides consistent logging interface that adapts based on environment:
 * - Development: Outputs to console with formatting
 * - Production: Sends errors to error tracking service (Sentry)
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to fetch data', error);
 * logger.debug('Debug info', { data });
 * ```
 */
class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  /**
   * Internal logging method that handles formatting and routing
   *
   * @param level - The severity level of the log
   * @param message - Human-readable message describing the event
   * @param data - Optional additional context data
   */
  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDev && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    if (this.isDev) {
      console[level === 'error' ? 'error' : 'log'](
        `[${level.toUpperCase()}]`,
        message,
        data || ''
      );
    } else {
      // In production, send to error tracking service
      if (level === 'error') {
        // Send to Sentry/LogRocket
        this.sendToErrorTracking(logData);
      }
    }
  }

  /**
   * Sends error data to external error tracking service
   *
   * @param logData - Structured log data to send
   */
  private sendToErrorTracking(logData: any) {
    // Implement Sentry or other error tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(logData.message), {
        extra: logData,
      });
    }
  }

  /**
   * Log informational messages
   *
   * @param message - Description of the event
   * @param data - Optional additional context
   *
   * @example
   * logger.info('User logged in', { userId: user.id });
   */
  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  /**
   * Log warning messages for potentially problematic situations
   *
   * @param message - Description of the warning
   * @param data - Optional additional context
   *
   * @example
   * logger.warn('Slow API response', { duration: 5000 });
   */
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  /**
   * Log error messages for failures and exceptions
   *
   * @param message - Description of the error
   * @param error - Error object or additional context
   *
   * @example
   * logger.error('Failed to fetch courses', error);
   */
  error(message: string, error?: Error | any) {
    this.log('error', message, error);
  }

  /**
   * Log debug messages for development troubleshooting
   * Only outputs in development mode
   *
   * @param message - Description of debug info
   * @param data - Optional additional context
   *
   * @example
   * logger.debug('API response', { data: response });
   */
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
