import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plane,
  Building2,
  Compass,
  MapPin,
  CheckCircle2,
  Loader2,
  Clock,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface AgentProcessingScreenProps {
  language: Language;
}

export const AgentProcessingScreen: React.FC<AgentProcessingScreenProps> = ({
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(15);

  const stepList = [
    {
      icon: Sparkles,
      title: 'DeepSeek NLU Engine',
      desc: t.steps.nlu,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      icon: Plane,
      title: 'SerpApi Google Flights',
      desc: t.steps.flights,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      icon: Building2,
      title: 'Booking.com RapidAPI',
      desc: t.steps.hotels,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-200',
    },
    {
      icon: MapPin,
      title: 'SerpApi Google Maps / Places',
      desc: t.steps.places,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      icon: Compass,
      title: 'K-Means Spatial Clustering (K=Days)',
      desc: t.steps.clustering,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200',
    },
    {
      icon: Clock,
      title: 'Chronological Itinerary Dispatcher',
      desc: t.steps.itinerary,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < stepList.length - 1) {
          return prev + 1;
        }
        return prev;
      });
      setProgress((prev) => Math.min(95, prev + 15));
    }, 1100);

    return () => clearInterval(interval);
  }, [stepList.length]);

  return (
    <div className="mx-auto my-12 max-w-3xl px-4 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500 mb-3 border border-sky-100">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t.agentStepsTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {t.agentStepsSubtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Orchestration Progress</span>
            <span className="text-sky-500 font-bold">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-slate-900 via-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Multi-step execution list */}
        <div className="mt-8 space-y-3">
          {stepList.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            const isPending = idx > currentStepIdx;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                  isActive
                    ? 'border-sky-300 bg-sky-50/60 ring-2 ring-sky-500/10 shadow-2xs'
                    : isCompleted
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50/50 opacity-50'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-white text-sky-500 shadow-2xs border border-sky-200'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-bold ${
                        isActive
                          ? 'text-slate-900'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/70'
                          : isActive
                          ? 'bg-sky-100 text-sky-700 animate-pulse'
                          : 'text-slate-400'
                      }`}
                    >
                      {isCompleted
                        ? 'Done'
                        : isActive
                        ? 'Executing...'
                        : 'Waiting'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
