import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ExpenseInput } from '../domain/expense.schema';
import { expenseInputSchema } from '../domain/expense.schema';
import './ExpenseForm.css';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseInput) => void;
  onCancel?: () => void;
  initialData?: Partial<ExpenseInput>;
}

export const ExpenseForm = ({ onSubmit, onCancel, initialData }: ExpenseFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseInputSchema),
    defaultValues: initialData ?? {
      amount: 0,
      description: '',
      category: 'other',
      date: new Date().toISOString().slice(0, 16),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="expense-form"
    >
      <div className="form-group">
        <label htmlFor="amount" className="form-label">
          Amount *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <span className="form-error">{errors.amount.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description *
        </label>
        <input
          id="description"
          type="text"
          className={`form-input ${errors.description ? 'form-input-error' : ''}`}
          {...register('description')}
        />
        {errors.description && <span className="form-error">{errors.description.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Category *
        </label>
        <select
          id="category"
          className={`form-input ${errors.category ? 'form-input-error' : ''}`}
          {...register('category')}
        >
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>
        {errors.category && <span className="form-error">{errors.category.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="date" className="form-label">
          Date *
        </label>
        <input
          id="date"
          type="datetime-local"
          className={`form-input ${errors.date ? 'form-input-error' : ''}`}
          {...register('date', {
            setValueAs: (value: string) => {
              if (!value) return new Date().toISOString();
              return new Date(value).toISOString();
            },
          })}
        />
        {errors.date && <span className="form-error">{errors.date.message}</span>}
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
};
