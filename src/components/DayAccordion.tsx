import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  Route,
  Sparkles,
} from 'lucide-react';
import { DayPlan } from '../../types/index';
import { LocationCard } from './LocationCard';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface DayAccordionProps {
  days: DayPlan[];
  language: Language;
}

export const DayAccordion: React.FC<DayAccordionProps> = ({
  days,
  language,
}) => {
  const t = TRANSLATIONS[language];
  // Expand day 1 by default
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    1: true,
  });

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    days.forEach((d) => (all[d.dayNumber] = true));
    setExpandedDays(all);
  };

  const collapseAll = () => {
    setExpandedDays({});
  };

  return (
    <div className="mt-8 space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-900">
            {t.dayScheduleTitle}
          </h3>
          <span className="rounded-full bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-xs font-bold text-sky-700">
            {days.length} {language === 'ar' ? 'أيام مجمعة مكانياً' : 'Spatial Zones'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-sky-600 transition cursor-pointer"
          >
            {language === 'ar' ? 'توسيع الكل' : 'Expand All'}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-sky-600 transition cursor-pointer"
          >
            {language === 'ar' ? 'طي الكل' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {days.map((day) => {
          const isExpanded = !!expandedDays[day.dayNumber];

          return (
            <div
              key={day.dayNumber}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition"
            >
              {/* Accordion Trigger Header */}
              <div
                onClick={() => toggleDay(day.dayNumber)}
                className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-4 sm:p-5 hover:bg-slate-100/60 transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sky-400 font-black text-sm shadow-xs border border-slate-800">
                    D{day.dayNumber}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {day.title}
                      </h4>
                      <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {day.places.length} {t.stopsCount}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                      {day.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/40">
                  {/* Distance pill */}
                  {day.totalDistanceKm > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                      <Route className="h-3.5 w-3.5" />
                      <span>{day.totalDistanceKm} km</span>
                    </span>
                  )}

                  {/* Direct Multi-Stop Route Button */}
                  <a
                    id={`day-route-btn-${day.dayNumber}`}
                    href={day.mapsRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-600 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{t.dayRouteBtn}</span>
                    <span className="md:hidden">Maps</span>
                  </a>

                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Content Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/30">
                  {/* Schedule Sequence Bar */}
                  <div className="mb-5 flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-500" />
                      <span className="font-semibold text-slate-800">
                        Sequential Spatial Path:
                      </span>
                      <span className="hidden sm:inline text-slate-500">
                        Breakfast → Activity 1 → Lunch → Attraction → Dinner
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Clustered Zone {day.dayNumber}
                    </span>
                  </div>

                  {/* Location Cards Timeline */}
                  <div className="space-y-4">
                    {day.places.map((place, pIdx) => (
                      <LocationCard
                        key={place.id || pIdx}
                        place={place}
                        stopNumber={pIdx + 1}
                        language={language}
                      />
                    ))}
                  </div>

                  {/* Day Footer Navigation CTA */}
                  <div className="mt-5 flex justify-end">
                    <a
                      href={day.mapsRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-2 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-100 transition"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>{t.dayRouteBtn}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
