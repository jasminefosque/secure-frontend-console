import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Expense, ExpenseInput } from '../domain/expense.schema';
import { expenseSchema, expensesArraySchema } from '../domain/expense.schema';
import { logger } from '../utils/logger';

interface ExpensesState {
  items: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  loading: false,
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<ExpenseInput>) => {
      const now = new Date().toISOString();
      const newExpense: Expense = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const result = expenseSchema.safeParse(newExpense);
      if (!result.success) {
        logger.error('expense_validation_failed', result.error.message, {
          action: 'add',
        });
        state.error = 'Failed to add expense: Invalid data';
        return;
      }

      state.items.push(result.data);
      state.error = null;
      logger.info('expense_added', {
        expenseId: result.data.id,
        category: result.data.category,
        amount: result.data.amount,
      });
    },

    updateExpense: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<ExpenseInput> }>
    ) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.error = 'Expense not found';
        return;
      }

      const updatedExpense: Expense = {
        ...state.items[index],
        ...action.payload.updates,
        updatedAt: new Date().toISOString(),
      };

      const result = expenseSchema.safeParse(updatedExpense);
      if (!result.success) {
        logger.error('expense_validation_failed', result.error.message, {
          action: 'update',
          expenseId: action.payload.id,
        });
        state.error = 'Failed to update expense: Invalid data';
        return;
      }

      state.items[index] = result.data;
      state.error = null;
      logger.info('expense_updated', {
        expenseId: result.data.id,
      });
    },

    deleteExpense: (state, action: PayloadAction<string>) => {
      const initialLength = state.items.length;
      state.items = state.items.filter((item) => item.id !== action.payload);

      if (state.items.length < initialLength) {
        logger.info('expense_deleted', { expenseId: action.payload });
      }
    },

    clearAllExpenses: (state) => {
      const count = state.items.length;
      state.items = [];
      state.error = null;
      logger.info('expenses_cleared', { count });
    },

    loadExpenses: (state, action: PayloadAction<unknown>) => {
      const result = expensesArraySchema.safeParse(action.payload);
      if (!result.success) {
        logger.error('expenses_load_failed', result.error.message);
        state.error = 'Failed to load expenses: Invalid data';
        return;
      }

      state.items = result.data;
      state.error = null;
      logger.info('expenses_loaded', { count: result.data.length });
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addExpense,
  updateExpense,
  deleteExpense,
  clearAllExpenses,
  loadExpenses,
  setError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
