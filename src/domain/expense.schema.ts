import { z } from 'zod';

export const expenseSchema = z.object({
  id: z.string().uuid(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum of 1,000,000')
    .finite('Amount must be a finite number'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less')
    .trim(),
  category: z.enum(['food', 'transport', 'utilities', 'entertainment', 'other'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  date: z.string().datetime({ message: 'Invalid date format' }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const expenseInputSchema = expenseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const expensesArraySchema = z.array(expenseSchema);

export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseInput = z.infer<typeof expenseInputSchema>;

export const filterSchema = z.object({
  category: z.enum(['all', 'food', 'transport', 'utilities', 'entertainment', 'other']),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ExpenseFilter = z.infer<typeof filterSchema>;
