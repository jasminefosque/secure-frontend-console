import type { Expense, ExpenseFilter } from './expense.schema';

export const calculateTotalAmount = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateAverageAmount = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;
  return calculateTotalAmount(expenses) / expenses.length;
};

export const calculateCategoryTotals = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
    return totals;
  }, {});
};

export const filterExpenses = (expenses: Expense[], filter: ExpenseFilter): Expense[] => {
  return expenses.filter((expense) => {
    if (filter.category !== 'all' && expense.category !== filter.category) {
      return false;
    }

    if (filter.minAmount !== undefined && expense.amount < filter.minAmount) {
      return false;
    }

    if (filter.maxAmount !== undefined && expense.amount > filter.maxAmount) {
      return false;
    }

    if (filter.startDate && expense.date < filter.startDate) {
      return false;
    }

    if (filter.endDate && expense.date > filter.endDate) {
      return false;
    }

    return true;
  });
};

export const sortExpensesByDate = (expenses: Expense[], ascending = false): Expense[] => {
  return [...expenses].sort((a, b) => {
    const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    return ascending ? comparison : -comparison;
  });
};

export const sortExpensesByAmount = (expenses: Expense[], ascending = false): Expense[] => {
  return [...expenses].sort((a, b) => {
    const comparison = a.amount - b.amount;
    return ascending ? comparison : -comparison;
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};
