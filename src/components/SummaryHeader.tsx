import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Compass,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Share2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { TravelPlanResponse } from '../../types/index';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { useCurrency } from '../context/CurrencyContext';

interface SummaryHeaderProps {
  plan: TravelPlanResponse;
  language: Language;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  plan,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const { formatPrice, currency } = useCurrency();
  const [copied, setCopied] = useState(false);
  const { budgetSummary } = plan;

  const baseCurrency = plan.currency || 'USD';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const spentPercentage = Math.min(
    100,
    Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)
  );

  const dailyHotel =
    budgetSummary.dailyHotelBudget ||
    Math.round(budgetSummary.hotelCost / Math.max(1, plan.durationDays));

  const dailyActivities =
    budgetSummary.dailyActivitiesBudget ||
    Math.round(budgetSummary.estimatedActivitiesCost / Math.max(1, plan.durationDays));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      {/* Top Banner & Destination Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200/80 px-3 py-1 text-xs font-bold text-sky-700">
              <Compass className="h-3.5 w-3.5" />
              {plan.durationDays} {language === 'ar' ? 'أيام متتالية' : 'Days Trip'}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
              {plan.travelStyle} Style
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 text-xs font-semibold">
              Departure: {plan.origin}
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-3 py-1 text-xs font-semibold">
              Currency: {currency}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            {plan.destination}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span>
              {plan.aiNotes ||
                `Optimized spatial itinerary curated by DeepSeek AI & SerpApi.`}
            </span>
          </p>
        </div>

        {/* Action Buttons: Share & Print */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            id="share-plan-btn"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? t.copiedAlert : t.sharePlan}</span>
          </button>

          <button
            type="button"
            id="print-plan-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.exportPrint}</span>
          </button>
        </div>
      </div>

      {/* Budget Breakdown Cards Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-sky-500" />
            {language === 'ar' ? 'تفاصيل الميزانية وتوزيع التكاليف' : 'Budget Intelligence & Cost Allocation'}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              budgetSummary.isWithinBudget
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {budgetSummary.isWithinBudget ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t.budgetHealthy}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{t.budgetExceeded}</span>
              </>
            )}
          </span>
        </div>

        {/* 4 Cards: Total Budget, Flight, Hotel, Activities/Remaining */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Budget */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <span className="text-[11px] font-semibold text-slate-500">
              {t.totalBudget}
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {formatPrice(budgetSummary.totalBudget, baseCurrency, language)}
            </div>
            <span className="text-[10px] text-slate-400">
              {language === 'ar' ? 'إجمالي الميزانية المخصصة' : 'Allocated trip budget'}
            </span>
          </div>

          {/* Flight Cost */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3.5">
            <span className="text-[11px] font-semibold text-sky-700">
              {t.flightCost}
            </span>
            <div className="text-lg sm:text-xl font-black text-sky-950 mt-0.5">
              {formatPrice(budgetSummary.flightCost, baseCurrency, language)}
            </div>
            <span className="text-[10px] text-sky-600 font-medium">
              {language === 'ar' ? 'سعر ثابت ذهاب وإياب' : 'Fixed return flight'}
            </span>
          </div>

          {/* Hotel Cost */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5">
            <span className="text-[11px] font-semibold text-emerald-700">
              {t.hotelCost}
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
              {formatPrice(budgetSummary.hotelCost, baseCurrency, language)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {formatPrice(dailyHotel, baseCurrency, language)}
              {language === 'ar' ? ` /ليلة × ${plan.durationDays} ليالٍ` : `/night × ${plan.durationDays}n`}
            </span>
          </div>

          {/* Remaining Balance / Activities */}
          <div
            className={`rounded-xl border p-3.5 ${
              budgetSummary.remainingBudget >= 0
                ? 'border-slate-200 bg-slate-900 text-white'
                : 'border-amber-200 bg-amber-50/40 text-amber-900'
            }`}
          >
            <span
              className={`text-[11px] font-semibold ${
                budgetSummary.remainingBudget >= 0
                  ? 'text-sky-300'
                  : 'text-amber-700'
              }`}
            >
              {t.remainingBudget}
            </span>
            <div
              className={`text-lg sm:text-xl font-black mt-0.5 ${
                budgetSummary.remainingBudget >= 0
                  ? 'text-white'
                  : 'text-amber-900'
              }`}
            >
              {formatPrice(budgetSummary.remainingBudget, baseCurrency, language)}
            </div>
            <span
              className={`text-[10px] font-medium ${
                budgetSummary.remainingBudget >= 0
                  ? 'text-slate-300'
                  : 'text-amber-600'
              }`}
            >
              {formatPrice(dailyActivities, baseCurrency, language)}
              {language === 'ar' ? ` /يوم أنشطة` : `/day activities`}
            </span>
          </div>
        </div>

        {/* Budget Bar visualization */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>{language === 'ar' ? 'مؤشر استخدام الميزانية' : 'Budget Utilization'}</span>
            <span>
              {formatPrice(budgetSummary.totalSpent, baseCurrency, language)} /{' '}
              {formatPrice(budgetSummary.totalBudget, baseCurrency, language)} ({spentPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              className="h-full bg-sky-500"
              style={{
                width: `${(budgetSummary.flightCost / budgetSummary.totalBudget) * 100}%`,
              }}
              title="Flights"
            />
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${(budgetSummary.hotelCost / budgetSummary.totalBudget) * 100}%`,
              }}
              title="Hotels"
            />
            <div
              className="h-full bg-amber-400"
              style={{
                width: `${(budgetSummary.estimatedActivitiesCost / budgetSummary.totalBudget) * 100}%`,
              }}
              title="Activities"
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500 inline-block" /> {language === 'ar' ? 'طيران' : 'Flights'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> {language === 'ar' ? 'فندق' : 'Hotels'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> {language === 'ar' ? 'أنشطة ومطاعم' : 'Activities & Dining'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
