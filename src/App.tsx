import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroPromptSection } from './components/HeroPromptSection';
import { AgentProcessingScreen } from './components/AgentProcessingScreen';
import { ItineraryDashboard } from './components/ItineraryDashboard';
import { Language } from './lib/i18n';
import { TravelPlanResponse, UserInputPlanRequest } from '../types/index';
import { Compass, AlertCircle } from 'lucide-react';
import { orchestrateTravelPlan } from '../lib/services/planOrchestrator';
import { CurrencyProvider, useCurrency, SupportedCurrency } from './context/CurrencyContext';

function MainApp() {
  const [language, setLanguage] = useState<Language>('en');
  const { currency, setCurrency } = useCurrency();
  const [plan, setPlan] = useState<TravelPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync RTL direction and html lang tag
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePlan = async (input: UserInputPlanRequest) => {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // First attempt: Call full-stack server endpoint POST /api/plan
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.plan) {
          if (data.plan.currency) {
            setCurrency(data.plan.currency as SupportedCurrency);
          }
          setPlan(data.plan);
          setIsLoading(false);
          return;
        }
      }

      console.warn('API endpoint returned error or non-200, trying direct orchestrator...');
      // Fallback: Run orchestrator directly in client if Express proxy was bypassed
      const directPlan = await orchestrateTravelPlan(input);
      if (directPlan.currency) {
        setCurrency(directPlan.currency as SupportedCurrency);
      }
      setPlan(directPlan);
    } catch (err: any) {
      console.warn('Primary /api/plan request failed, fallback to direct orchestrator:', err);
      try {
        const directPlan = await orchestrateTravelPlan(input);
        if (directPlan.currency) {
          setCurrency(directPlan.currency as SupportedCurrency);
        }
        setPlan(directPlan);
      } catch (fallbackErr: any) {
        console.error('All orchestration attempts failed:', fallbackErr);
        setError(fallbackErr.message || 'Failed to generate travel plan. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900"
    >
      {/* Top Navbar */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        currency={currency}
        onChangeCurrency={(c) => setCurrency(c as SupportedCurrency)}
        onReset={handleReset}
        hasPlan={!!plan}
      />

      {/* Error alert if any */}
      {error && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 shadow-xs">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main View Router: Hero/Prompt -> Loading Screen -> Itinerary Dashboard */}
      <main>
        {isLoading ? (
          <AgentProcessingScreen language={language} />
        ) : plan ? (
          <ItineraryDashboard plan={plan} language={language} />
        ) : (
          <HeroPromptSection
            language={language}
            currency={currency}
            onGenerate={handleGeneratePlan}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Compass className="h-4 w-4 text-sky-500" />
            <span>SmartTravel AI • Full-Stack Agentic Travel Architecture</span>
          </div>
          <p className="text-slate-400">
            Powered by DeepSeek NLU • K-Means Spatial Clustering • SerpApi Google Flights & Places • Booking.com RapidAPI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider initialCurrency="SAR">
      <MainApp />
    </CurrencyProvider>
  );
}
