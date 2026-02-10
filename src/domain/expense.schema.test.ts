import { describe, it, expect } from 'vitest';
import { expenseInputSchema, filterSchema } from '../domain/expense.schema';

describe('Expense Schema Validation', () => {
  describe('expenseInputSchema', () => {
    it('should accept valid expense input', () => {
      const validInput = {
        amount: 100.5,
        description: 'Grocery shopping',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject negative amounts', () => {
      const invalidInput = {
        amount: -50,
        description: 'Test',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject zero amounts', () => {
      const invalidInput = {
        amount: 0,
        description: 'Test',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject amounts exceeding maximum', () => {
      const invalidInput = {
        amount: 2000000,
        description: 'Test',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty descriptions', () => {
      const invalidInput = {
        amount: 50,
        description: '',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject descriptions exceeding 200 characters', () => {
      const invalidInput = {
        amount: 50,
        description: 'a'.repeat(201),
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from descriptions', () => {
      const input = {
        amount: 50,
        description: '  Test description  ',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Test description');
      }
    });

    it('should reject invalid categories', () => {
      const invalidInput = {
        amount: 50,
        description: 'Test',
        category: 'invalid-category',
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date formats', () => {
      const invalidInput = {
        amount: 50,
        description: 'Test',
        category: 'food' as const,
        date: 'not-a-date',
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject Infinity values', () => {
      const invalidInput = {
        amount: Infinity,
        description: 'Test',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject NaN values', () => {
      const invalidInput = {
        amount: NaN,
        description: 'Test',
        category: 'food' as const,
        date: new Date().toISOString(),
      };

      const result = expenseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('filterSchema', () => {
    it('should accept valid filters', () => {
      const validFilter = {
        category: 'food' as const,
        minAmount: 0,
        maxAmount: 1000,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      };

      const result = filterSchema.safeParse(validFilter);
      expect(result.success).toBe(true);
    });

    it('should accept "all" category', () => {
      const filter = {
        category: 'all' as const,
      };

      const result = filterSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });

    it('should reject negative minAmount', () => {
      const filter = {
        category: 'all' as const,
        minAmount: -10,
      };

      const result = filterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });

    it('should reject zero or negative maxAmount', () => {
      const filter = {
        category: 'all' as const,
        maxAmount: 0,
      };

      const result = filterSchema.safeParse(filter);
      expect(result.success).toBe(false);
    });
  });
});
