import type { Expense } from '../domain/expense.schema';
import { formatCurrency, formatDateTime } from '../domain/expense.logic';

const escapeCSVField = (field: string | number): string => {
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const exportToCSV = (expenses: Expense[]): Blob => {
  const headers = ['ID', 'Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map((expense) => [
    escapeCSVField(expense.id),
    escapeCSVField(formatDateTime(expense.date)),
    escapeCSVField(expense.category),
    escapeCSVField(expense.description),
    escapeCSVField(formatCurrency(expense.amount)),
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

export const exportToJSON = (expenses: Expense[]): Blob => {
  const json = JSON.stringify(expenses, null, 2);
  return new Blob([json], { type: 'application/json;charset=utf-8;' });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
