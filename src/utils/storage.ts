import { logger } from './logger';

export interface StorageAdapter {
  getItem<T>(key: string, validator: (data: unknown) => T | undefined): T | undefined;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clear(): void;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string, validator: (data: unknown) => T | undefined): T | undefined {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return undefined;
      }

      const parsed = JSON.parse(serialized);
      const validated = validator(parsed);

      if (!validated) {
        logger.warn('storage_validation_failed', { key });
        return undefined;
      }

      return validated;
    } catch (error) {
      logger.error('storage_read_error', error as Error, { key });
      return undefined;
    }
  }

  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.error('storage_write_error', error as Error, {
        key,
        dataSize: JSON.stringify(value).length,
      });
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('storage_remove_error', error as Error, { key });
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      logger.info('storage_cleared');
    } catch (error) {
      logger.error('storage_clear_error', error as Error);
    }
  }
}

export const storage = new LocalStorageAdapter();
