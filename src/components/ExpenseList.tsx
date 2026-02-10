import type { Expense } from '../domain/expense.schema';
import { formatCurrency, formatDate } from '../domain/expense.logic';
import './ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>No expenses to display. Add your first expense to get started.</p>
      </div>
    );
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      food: '#10b981',
      transport: '#3b82f6',
      utilities: '#f59e0b',
      entertainment: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[category] ?? colors.other;
  };

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <div key={expense.id} className="expense-item">
          <div className="expense-item-header">
            <span
              className="expense-category"
              style={{ backgroundColor: getCategoryColor(expense.category) }}
            >
              {expense.category}
            </span>
            <span className="expense-date">{formatDate(expense.date)}</span>
          </div>
          <div className="expense-item-body">
            <h3 className="expense-description">{expense.description}</h3>
            <p className="expense-amount">{formatCurrency(expense.amount)}</p>
          </div>
          <div className="expense-item-actions">
            <button
              onClick={() => onEdit(expense)}
              className="btn-icon"
              aria-label="Edit expense"
              type="button"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="btn-icon btn-icon-danger"
              aria-label="Delete expense"
              type="button"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
