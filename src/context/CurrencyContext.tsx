import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedCurrency = 'USD' | 'EUR' | 'SAR' | 'AED' | 'GBP';

// Exchange rates pegged to 1 USD base
export const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  SAR: 3.75, // Fixed Saudi Riyal peg
  AED: 3.6725, // Fixed UAE Dirham peg
  EUR: 0.92,
  GBP: 0.79,
};

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, { en: string; ar: string; isPrefix?: boolean }> = {
  USD: { en: '$', ar: '$', isPrefix: true },
  EUR: { en: '€', ar: '€', isPrefix: true },
  SAR: { en: 'SAR', ar: 'ر.س', isPrefix: false },
  AED: { en: 'AED', ar: 'د.إ', isPrefix: false },
  GBP: { en: '£', ar: '£', isPrefix: true },
};

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency | string) => void;
  currencySymbol: string;
  getSymbol: (lang?: 'en' | 'ar') => string;
  convertPrice: (amount: number, fromCurrency?: string) => number;
  formatPrice: (amount: number, fromCurrency?: string, lang?: 'en' | 'ar') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{
  children: React.ReactNode;
  initialCurrency?: SupportedCurrency | string;
}> = ({ children, initialCurrency = 'USD' }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem('smarttravel_currency') as SupportedCurrency;
    if (saved && EXCHANGE_RATES[saved]) return saved;
    const normalized = (initialCurrency || 'USD').toUpperCase() as SupportedCurrency;
    return EXCHANGE_RATES[normalized] ? normalized : 'USD';
  });

  const setCurrency = (newCurr: SupportedCurrency | string) => {
    const normalized = (newCurr || 'USD').toUpperCase() as SupportedCurrency;
    if (EXCHANGE_RATES[normalized]) {
      setCurrencyState(normalized);
      localStorage.setItem('smarttravel_currency', normalized);
    }
  };

  const getSymbol = (lang: 'en' | 'ar' = 'en'): string => {
    const sym = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.USD;
    return lang === 'ar' ? sym.ar : sym.en;
  };

  const convertPrice = (amount: number, fromCurrency?: string): number => {
    if (isNaN(amount) || amount == null) return 0;
    const from = (fromCurrency || currency).toUpperCase() as SupportedCurrency;
    const fromRate = EXCHANGE_RATES[from] || 1.0;
    const toRate = EXCHANGE_RATES[currency] || 1.0;

    // Convert from source currency to USD, then to target currency
    const inUSD = amount / fromRate;
    const converted = inUSD * toRate;
    return Math.round(converted);
  };

  const formatPrice = (
    amount: number,
    fromCurrency?: string,
    lang: 'en' | 'ar' = 'en'
  ): string => {
    const numericValue = convertPrice(amount, fromCurrency);
    const formattedNum = numericValue.toLocaleString();
    const config = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.USD;
    const symbol = lang === 'ar' ? config.ar : config.en;

    if (config.isPrefix && lang !== 'ar') {
      return `${symbol}${formattedNum}`;
    }
    // In Arabic or for postfix symbols like SAR/AED: "3,600 ر.س" or "3,600 SAR"
    return `${formattedNum} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol: getSymbol('en'),
        getSymbol,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
