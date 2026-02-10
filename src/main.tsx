import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, loadStateFromStorage } from './app/store';
import { loadExpenses } from './features/expensesSlice';
import './index.css';
import App from './App.tsx';

const persistedState = loadStateFromStorage();
if (persistedState) {
  store.dispatch(loadExpenses(persistedState.expenses.items));
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
