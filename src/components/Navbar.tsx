import React from 'react';
import { Compass, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { useCurrency, SupportedCurrency } from '../context/CurrencyContext';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  currency?: string;
  onChangeCurrency?: (curr: string) => void;
  onReset: () => void;
  hasPlan: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  currency: propCurrency,
  onChangeCurrency,
  onReset,
  hasPlan,
}) => {
  const t = TRANSLATIONS[language];
  const { currency: contextCurrency, setCurrency } = useCurrency();
  const currentCurrency = propCurrency || contextCurrency;

  const handleCurrencyChange = (newVal: string) => {
    setCurrency(newVal as SupportedCurrency);
    if (onChangeCurrency) {
      onChangeCurrency(newVal);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={onReset}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sky-400 shadow-xs border border-slate-800">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-lg sm:text-xl">
                SmartTravel<span className="text-sky-500">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200/70">
                <Sparkles className="mr-1 h-3 w-3" /> DeepSeek & K-Means
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium">
              Booking.com RapidAPI • SerpApi Flights & Places
            </p>
          </div>
        </div>

        {/* Right actions: Currency, Language, Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency selector */}
          <select
            id="currency-select"
            value={currentCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="SAR">SAR (ر.س - ريال سعودي)</option>
            <option value="USD">USD ($ - US Dollar)</option>
            <option value="EUR">EUR (€ - Euro)</option>
            <option value="AED">AED (د.إ - درهم إماراتي)</option>
            <option value="GBP">GBP (£ - British Pound)</option>
          </select>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.langToggle}</span>
          </button>

          {/* New Plan Button */}
          {hasPlan && (
            <button
              id="new-plan-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.newPlan}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
