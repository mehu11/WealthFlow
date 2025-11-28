import { createContext } from 'react';

// --- Global State & Context ---

export const initialState = {
  transactions: [],
  loading: true,
  error: null,
  filter: 'all', // all, income, expense
  user: null
};

export const financeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

export const FinanceContext = createContext();