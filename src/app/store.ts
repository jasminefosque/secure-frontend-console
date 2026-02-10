import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from '../features/expensesSlice';
import { storage } from '../utils/storage';
import { expensesArraySchema } from '../domain/expense.schema';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'secure-frontend-console-state';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const loadStateFromStorage = (): RootState | undefined => {
  const data = storage.getItem(STORAGE_KEY, (rawData) => {
    if (typeof rawData !== 'object' || rawData === null) {
      return undefined;
    }

    const stateData = rawData as Record<string, unknown>;
    if (!('expenses' in stateData)) {
      return undefined;
    }

    const expensesData = stateData.expenses as Record<string, unknown>;
    if (!('items' in expensesData) || !Array.isArray(expensesData.items)) {
      return undefined;
    }

    const result = expensesArraySchema.safeParse(expensesData.items);
    if (!result.success) {
      logger.warn('state_validation_failed', {
        error: result.error.message,
      });
      return undefined;
    }

    return {
      expenses: {
        items: result.data,
        loading: false,
        error: null,
      },
    } as RootState;
  }) as RootState | undefined;

  return data;
};

export const saveStateToStorage = (state: RootState): void => {
  const success = storage.setItem(STORAGE_KEY, {
    expenses: {
      items: state.expenses.items,
    },
  });

  if (success) {
    logger.info('state_saved', {
      itemCount: state.expenses.items.length,
    });
  }
};

store.subscribe(() => {
  const state = store.getState();
  saveStateToStorage(state);
});
