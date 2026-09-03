import React, { useState } from 'react';
import {
  Plane,
  ExternalLink,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FlightOption } from '../../types/index';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { useCurrency } from '../context/CurrencyContext';

interface FlightCardProps {
  flight: FlightOption;
  alternatives?: FlightOption[];
  onSelectFlight: (flight: FlightOption) => void;
  language: Language;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  alternatives = [],
  onSelectFlight,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const { formatPrice } = useCurrency();
  const [showAlternatives, setShowAlternatives] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t.flightCardTitle}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {flight.flightNumber} • {flight.cabinClass || 'Economy'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {formatPrice(flight.price, flight.currency, language)}
          </span>
          <span className="block text-[11px] font-medium text-slate-500">
            {language === 'ar' ? 'للشخص الواحد' : 'per person'}
          </span>
        </div>
      </div>

      {/* Flight Timeline Details */}
      <div className="mt-5 grid grid-cols-3 items-center text-center">
        {/* Departure */}
        <div className="text-left rtl:text-right">
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {flight.departureAirport}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            {flight.departureTime}
          </div>
        </div>

        {/* Flight duration / Stops graphic */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
            <Clock className="h-3 w-3" />
            <span>{flight.duration}</span>
          </div>
          <div className="relative w-full max-w-[120px] flex items-center">
            <div className="h-[2px] w-full bg-slate-200" />
            <Plane className="absolute left-1/2 -translate-x-1/2 h-3.5 w-3.5 text-sky-500" />
          </div>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
            {flight.stops === 0
              ? language === 'ar'
                ? 'مباشر بدون توقف'
                : 'Direct Flight'
              : `${flight.stops} ${language === 'ar' ? 'توقف' : 'Stop'}`}
          </span>
        </div>

        {/* Arrival */}
        <div className="text-right rtl:text-left">
          <div className="text-lg sm:text-xl font-bold text-slate-900">
            {flight.arrivalAirport}
          </div>
          <div className="text-xs font-semibold text-slate-600">
            {flight.arrivalTime}
          </div>
        </div>
      </div>

      {/* Airline name badge */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          {flight.airline}
        </span>
        <span className="text-[11px] text-slate-500">Live SerpApi fare</span>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
        {alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition cursor-pointer"
          >
            <span>
              {t.switchFlight} ({alternatives.length} {t.alternativesAvailable})
            </span>
            {showAlternatives ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        <a
          id="book-flight-btn"
          href={flight.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <span>{t.bookFlightBtn}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Alternative Flights Drawer */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Alternative Flight Fares
          </h4>
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs hover:bg-slate-100/80 transition"
            >
              <div>
                <span className="font-bold text-slate-900">{alt.airline}</span>{' '}
                <span className="text-slate-500">({alt.flightNumber})</span>
                <div className="text-[11px] text-slate-600">
                  {alt.departureTime} → {alt.arrivalTime} ({alt.duration},{' '}
                  {alt.stops === 0 ? 'Direct' : `${alt.stops} stop`})
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {formatPrice(alt.price, alt.currency, language)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectFlight(alt);
                    setShowAlternatives(false);
                  }}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
