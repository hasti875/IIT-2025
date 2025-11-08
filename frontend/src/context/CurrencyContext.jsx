import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to INR
    return localStorage.getItem('currency') || 'INR';
  });

  const [currencySymbol, setCurrencySymbol] = useState(() => {
    return localStorage.getItem('currencySymbol') || '₹';
  });

  // Currency options
  const currencies = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  };

  // Update currency
  const updateCurrency = (currencyCode) => {
    const selectedCurrency = currencies[currencyCode];
    if (selectedCurrency) {
      setCurrency(currencyCode);
      setCurrencySymbol(selectedCurrency.symbol);
      localStorage.setItem('currency', currencyCode);
      localStorage.setItem('currencySymbol', selectedCurrency.symbol);
    }
  };

  // Format amount with currency
  const formatAmount = (amount, showSymbol = true) => {
    const numAmount = parseFloat(amount) || 0;
    const formatted = numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return showSymbol ? `${currencySymbol}${formatted}` : formatted;
  };

  const value = {
    currency,
    currencySymbol,
    currencies,
    updateCurrency,
    formatAmount
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
