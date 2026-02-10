import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('test_event');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info messages with context', () => {
      logger.info('test_event', { userId: '123', action: 'save' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should include timestamp and level', () => {
      logger.info('test_event');
      const logCall = consoleLogSpy.mock.calls[0][0];
      if (typeof logCall === 'string') {
        expect(logCall).toContain('INFO');
        expect(logCall).toContain('test_event');
      }
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('test_warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log warning messages with context', () => {
      logger.warn('validation_failed', { field: 'email' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      logger.error('test_error', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error messages with string', () => {
      logger.error('test_error', 'Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include error message and stack', () => {
      const error = new Error('Test error');
      logger.error('test_error', error);
      const logCall = consoleErrorSpy.mock.calls[0][0];
      if (typeof logCall === 'string') {
        expect(logCall).toContain('ERROR');
        expect(logCall).toContain('test_error');
      }
    });

    it('should include context in error logs', () => {
      const error = new Error('Test error');
      logger.error('test_error', error, { userId: '123' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
