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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);

