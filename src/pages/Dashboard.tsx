import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  clearAllExpenses,
} from '../features/expensesSlice';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import type { Expense, ExpenseInput } from '../domain/expense.schema';
import {
  calculateTotalAmount,
  calculateAverageAmount,
  calculateCategoryTotals,
  formatCurrency,
  sortExpensesByDate,
} from '../domain/expense.logic';
import { exportToCSV, exportToJSON, downloadBlob } from '../utils/export';
import { logger } from '../utils/logger';
import './Dashboard.css';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.items);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const sortedExpenses = useMemo(() => sortExpensesByDate(expenses), [expenses]);

  const totalAmount = useMemo(() => calculateTotalAmount(expenses), [expenses]);
  const averageAmount = useMemo(() => calculateAverageAmount(expenses), [expenses]);
  const categoryTotals = useMemo(() => calculateCategoryTotals(expenses), [expenses]);

  const handleAddExpense = (data: ExpenseInput) => {
    dispatch(addExpense(data));
    setIsAddModalOpen(false);
    setToast({ message: 'Expense added successfully', type: 'success' });
    logger.info('user_action', { action: 'add_expense' });
  };

  const handleUpdateExpense = (data: ExpenseInput) => {
    if (!editingExpense) return;
    dispatch(updateExpense({ id: editingExpense.id, updates: data }));
    setEditingExpense(null);
    setToast({ message: 'Expense updated successfully', type: 'success' });
    logger.info('user_action', { action: 'update_expense' });
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(id));
      setToast({ message: 'Expense deleted successfully', type: 'success' });
      logger.info('user_action', { action: 'delete_expense' });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This cannot be undone.')) {
      dispatch(clearAllExpenses());
      setToast({ message: 'All expenses cleared', type: 'info' });
      logger.info('user_action', { action: 'clear_all' });
    }
  };

  const handleExportCSV = () => {
    const startTime = Date.now();
    const blob = exportToCSV(expenses);
    const duration = Date.now() - startTime;
    downloadBlob(blob, `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    setToast({ message: 'Exported to CSV successfully', type: 'success' });
    logger.info('export', {
      format: 'csv',
      rowCount: expenses.length,
      fileSize: blob.size,
      duration,
    });
  };

  const handleExportJSON = () => {
    const startTime = Date.now();
    const blob = exportToJSON(expenses);
    const duration = Date.now() - startTime;
    downloadBlob(blob, `expenses-${new Date().toISOString().split('T')[0]}.json`);
    setToast({ message: 'Exported to JSON successfully', type: 'success' });
    logger.info('export', {
      format: 'json',
      rowCount: expenses.length,
      fileSize: blob.size,
      duration,
    });
  };

  return (
    <div className="dashboard">
      <Header title="Expense Tracker" />

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button
            onClick={() => {
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Add Expense
          </button>
          <div className="dashboard-actions-group">
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              disabled={expenses.length === 0}
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="btn btn-secondary"
              disabled={expenses.length === 0}
            >
              Export JSON
            </button>
            <button
              onClick={handleClearAll}
              className="btn btn-danger"
              disabled={expenses.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <Card>
            <h3 className="stat-title">Total Expenses</h3>
            <p className="stat-value">{formatCurrency(totalAmount)}</p>
          </Card>
          <Card>
            <h3 className="stat-title">Average Amount</h3>
            <p className="stat-value">{formatCurrency(averageAmount)}</p>
          </Card>
          <Card>
            <h3 className="stat-title">Total Count</h3>
            <p className="stat-value">{expenses.length}</p>
          </Card>
        </div>

        {Object.keys(categoryTotals).length > 0 && (
          <Card className="category-breakdown">
            <h3 className="section-title">Category Breakdown</h3>
            <div className="category-list">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, total]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-total">{formatCurrency(total)}</span>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <div className="expenses-section">
          <h2 className="section-title">All Expenses</h2>
          <ExpenseList
            expenses={sortedExpenses}
            onEdit={setEditingExpense}
            onDelete={handleDeleteExpense}
          />
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => {
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={editingExpense !== null}
        onClose={() => {
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleUpdateExpense}
            onCancel={() => {
              setEditingExpense(null);
            }}
            initialData={{
              amount: editingExpense.amount,
              description: editingExpense.description,
              category: editingExpense.category,
              date: editingExpense.date,
            }}
          />
        )}
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(null);
          }}
        />
      )}
    </div>
  );
};
