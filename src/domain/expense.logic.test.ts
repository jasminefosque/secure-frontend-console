import { describe, it, expect } from 'vitest';
import type { Expense } from '../domain/expense.schema';
import {
  calculateTotalAmount,
  calculateAverageAmount,
  calculateCategoryTotals,
  filterExpenses,
  sortExpensesByDate,
  sortExpensesByAmount,
  formatCurrency,
  formatDate,
} from '../domain/expense.logic';

const createExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: crypto.randomUUID(),
  amount: 100,
  description: 'Test expense',
  category: 'food',
  date: new Date('2026-01-15').toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Expense Logic', () => {
  describe('calculateTotalAmount', () => {
    it('should return 0 for empty array', () => {
      expect(calculateTotalAmount([])).toBe(0);
    });

    it('should calculate total for single expense', () => {
      const expenses = [createExpense({ amount: 50 })];
      expect(calculateTotalAmount(expenses)).toBe(50);
    });

    it('should calculate total for multiple expenses', () => {
      const expenses = [
        createExpense({ amount: 50 }),
        createExpense({ amount: 75.50 }),
        createExpense({ amount: 100 }),
      ];
      expect(calculateTotalAmount(expenses)).toBe(225.50);
    });
  });

  describe('calculateAverageAmount', () => {
    it('should return 0 for empty array', () => {
      expect(calculateAverageAmount([])).toBe(0);
    });

    it('should calculate average for single expense', () => {
      const expenses = [createExpense({ amount: 50 })];
      expect(calculateAverageAmount(expenses)).toBe(50);
    });

    it('should calculate average for multiple expenses', () => {
      const expenses = [
        createExpense({ amount: 50 }),
        createExpense({ amount: 100 }),
        createExpense({ amount: 150 }),
      ];
      expect(calculateAverageAmount(expenses)).toBe(100);
    });
  });

  describe('calculateCategoryTotals', () => {
    it('should return empty object for empty array', () => {
      expect(calculateCategoryTotals([])).toEqual({});
    });

    it('should calculate totals for single category', () => {
      const expenses = [
        createExpense({ category: 'food', amount: 50 }),
        createExpense({ category: 'food', amount: 75 }),
      ];
      expect(calculateCategoryTotals(expenses)).toEqual({ food: 125 });
    });

    it('should calculate totals for multiple categories', () => {
      const expenses = [
        createExpense({ category: 'food', amount: 50 }),
        createExpense({ category: 'transport', amount: 30 }),
        createExpense({ category: 'food', amount: 25 }),
      ];
      expect(calculateCategoryTotals(expenses)).toEqual({
        food: 75,
        transport: 30,
      });
    });
  });

  describe('filterExpenses', () => {
    it('should return all expenses when filter is "all"', () => {
      const expenses = [
        createExpense({ category: 'food' }),
        createExpense({ category: 'transport' }),
      ];
      const filtered = filterExpenses(expenses, { category: 'all' });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by category', () => {
      const expenses = [
        createExpense({ category: 'food' }),
        createExpense({ category: 'transport' }),
        createExpense({ category: 'food' }),
      ];
      const filtered = filterExpenses(expenses, { category: 'food' });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((e) => e.category === 'food')).toBe(true);
    });

    it('should filter by minAmount', () => {
      const expenses = [
        createExpense({ amount: 50 }),
        createExpense({ amount: 100 }),
        createExpense({ amount: 150 }),
      ];
      const filtered = filterExpenses(expenses, {
        category: 'all',
        minAmount: 100,
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((e) => e.amount >= 100)).toBe(true);
    });

    it('should filter by maxAmount', () => {
      const expenses = [
        createExpense({ amount: 50 }),
        createExpense({ amount: 100 }),
        createExpense({ amount: 150 }),
      ];
      const filtered = filterExpenses(expenses, {
        category: 'all',
        maxAmount: 100,
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((e) => e.amount <= 100)).toBe(true);
    });

    it('should filter by date range', () => {
      const expenses = [
        createExpense({ date: new Date('2026-01-01').toISOString() }),
        createExpense({ date: new Date('2026-01-15').toISOString() }),
        createExpense({ date: new Date('2026-02-01').toISOString() }),
      ];
      const filtered = filterExpenses(expenses, {
        category: 'all',
        startDate: new Date('2026-01-10').toISOString(),
        endDate: new Date('2026-01-20').toISOString(),
      });
      expect(filtered).toHaveLength(1);
    });

    it('should apply multiple filters', () => {
      const expenses = [
        createExpense({ category: 'food', amount: 50 }),
        createExpense({ category: 'food', amount: 150 }),
        createExpense({ category: 'transport', amount: 100 }),
      ];
      const filtered = filterExpenses(expenses, {
        category: 'food',
        minAmount: 100,
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].amount).toBe(150);
    });
  });

  describe('sortExpensesByDate', () => {
    it('should sort by date descending by default', () => {
      const expenses = [
        createExpense({ date: new Date('2026-01-15').toISOString() }),
        createExpense({ date: new Date('2026-01-01').toISOString() }),
        createExpense({ date: new Date('2026-02-01').toISOString() }),
      ];
      const sorted = sortExpensesByDate(expenses);
      expect(new Date(sorted[0].date).getTime()).toBeGreaterThan(
        new Date(sorted[1].date).getTime()
      );
      expect(new Date(sorted[1].date).getTime()).toBeGreaterThan(
        new Date(sorted[2].date).getTime()
      );
    });

    it('should sort by date ascending when specified', () => {
      const expenses = [
        createExpense({ date: new Date('2026-01-15').toISOString() }),
        createExpense({ date: new Date('2026-01-01').toISOString() }),
        createExpense({ date: new Date('2026-02-01').toISOString() }),
      ];
      const sorted = sortExpensesByDate(expenses, true);
      expect(new Date(sorted[0].date).getTime()).toBeLessThan(
        new Date(sorted[1].date).getTime()
      );
      expect(new Date(sorted[1].date).getTime()).toBeLessThan(
        new Date(sorted[2].date).getTime()
      );
    });

    it('should not mutate original array', () => {
      const expenses = [
        createExpense({ date: new Date('2026-01-15').toISOString() }),
        createExpense({ date: new Date('2026-01-01').toISOString() }),
      ];
      const originalFirst = expenses[0].date;
      sortExpensesByDate(expenses);
      expect(expenses[0].date).toBe(originalFirst);
    });
  });

  describe('sortExpensesByAmount', () => {
    it('should sort by amount descending by default', () => {
      const expenses = [
        createExpense({ amount: 100 }),
        createExpense({ amount: 50 }),
        createExpense({ amount: 150 }),
      ];
      const sorted = sortExpensesByAmount(expenses);
      expect(sorted[0].amount).toBe(150);
      expect(sorted[1].amount).toBe(100);
      expect(sorted[2].amount).toBe(50);
    });

    it('should sort by amount ascending when specified', () => {
      const expenses = [
        createExpense({ amount: 100 }),
        createExpense({ amount: 50 }),
        createExpense({ amount: 150 }),
      ];
      const sorted = sortExpensesByAmount(expenses, true);
      expect(sorted[0].amount).toBe(50);
      expect(sorted[1].amount).toBe(100);
      expect(sorted[2].amount).toBe(150);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format decimal amounts', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });
  });

  describe('formatDate', () => {
    it('should format valid date strings', () => {
      const dateStr = new Date('2026-01-15').toISOString();
      const formatted = formatDate(dateStr);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });
  });
});
