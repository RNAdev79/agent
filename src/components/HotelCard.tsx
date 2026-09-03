import React, { useState } from 'react';
import {
  Building2,
  Star,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { HotelOption } from '../../types/index';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { useCurrency } from '../context/CurrencyContext';

interface HotelCardProps {
  hotel: HotelOption | null;
  durationDays: number;
  alternatives?: HotelOption[];
  onSelectHotel: (hotel: HotelOption) => void;
  language: Language;
  hotelStatus?: 'ok' | 'no_hotels_within_budget';
  hotelMaxBudget?: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  durationDays,
  alternatives = [],
  onSelectHotel,
  language,
  hotelStatus,
  hotelMaxBudget,
}) => {
  const t = TRANSLATIONS[language];
  const { formatPrice } = useCurrency();
  const [showAlternatives, setShowAlternatives] = useState(false);

  // ZERO-RESULTS FALLBACK (التعامل عند عدم وجود نتائج):
  // When no hotels meet the criteria (price <= daily_hotel_budget)
  if (!hotel || hotelStatus === 'no_hotels_within_budget') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-amber-200/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {language === 'ar' ? 'وكيل المشتريات الفندقية' : 'Hotel Procurement Specialist'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {language === 'ar'
                    ? 'لم يتم العثور على فنادق ضمن الميزانية المحددة'
                    : 'No Hotels Within Daily Budget Cap'}
                </h3>
              </div>
            </div>

            {hotelMaxBudget ? (
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">
                  {language === 'ar' ? 'السقف الأعلى اليومي' : 'Daily Price Cap'}
                </span>
                <span className="text-base font-black text-amber-700">
                  {formatPrice(hotelMaxBudget)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Body Notice */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-white/80 p-3.5 rounded-xl border border-amber-200/70">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {language === 'ar'
                    ? `التزام صارم بالسقف السعري: تم تصفية خيارات Booking.com بسقف أقصى لا يتجاوز ${formatPrice(
                        hotelMaxBudget || 0
                      )} لكل ليلة.`
                    : `Strict Budget Cap Enforced: Booking.com search was executed with price_max strictly <= ${formatPrice(
                        hotelMaxBudget || 0
                      )}/night.`}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {language === 'ar'
                    ? 'بموجب توجيهات وكيل المشتريات الفندقية، تم استبعاد أي فنادق تتجاوز هذا السقف منعاً لزيادة النفقات أو تجاوز الميزانية المخصصة للرحلة.'
                    : 'Under strict procurement rules, higher-priced hotels were automatically discarded to protect your financial ceiling.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {language === 'ar'
                    ? 'إجراء مقترح لضبط الميزانية'
                    : 'Recommended Action: Adjust Hotel Budget'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? `يرجى رفع الميزانية اليومية للفندق قليلاً (مثلاً إلى ${formatPrice(
                      (hotelMaxBudget || 400) + 150
                    )}/ليلة) لإتاحة خيارات فندقية ذات تقييم 8.0+ على Booking.com.`
                  : `Consider increasing your daily hotel budget (e.g., to ${formatPrice(
                      (hotelMaxBudget || 100) + 40
                    )}/night) to unlock high-rated 8.0+ properties on Booking.com.`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-amber-200/60 pt-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            status: <code className="font-mono text-amber-800 font-bold">no_hotels_within_budget</code>
          </span>
          <a
            href="https://www.booking.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
          >
            <span>{language === 'ar' ? 'تصفح Booking.com' : 'Explore on Booking.com'}</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
      <div>
        {/* Header & Pricing */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.hotelCardTitle}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Booking.com
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="text-[11px] font-medium text-slate-500 ml-1">
                  {hotel.stars}-Star Property
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {formatPrice(hotel.totalPrice, hotel.currency, language)}
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              {formatPrice(hotel.pricePerNight, hotel.currency, language)}
              {language === 'ar' ? ` /ليلة • ${durationDays} ليالٍ` : `/night • ${durationDays} nights`}
            </span>
          </div>
        </div>

        {/* Hotel Details with Photo */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <img
            src={hotel.photoUrl}
            alt={hotel.name}
            referrerPolicy="no-referrer"
            className="h-32 sm:h-28 w-full sm:w-36 rounded-xl object-cover shrink-0 border border-slate-100"
          />

          <div className="flex-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {hotel.name}
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{hotel.address}</span>
            </div>

            {/* Guest review score badge */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                {hotel.rating} / 10
              </span>
              <span className="text-xs font-medium text-slate-600">
                {hotel.rating >= 9.0
                  ? 'Wonderful'
                  : hotel.rating >= 8.5
                  ? 'Very Good'
                  : 'Good'}{' '}
                ({hotel.reviewsCount || 1200} reviews)
              </span>
            </div>

            {/* Amenities Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hotel.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        {alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition cursor-pointer"
          >
            <span>
              {t.switchHotel} ({alternatives.length} {t.alternativesAvailable})
            </span>
            {showAlternatives ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        <a
          id="book-hotel-btn"
          href={hotel.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition"
        >
          <span>{t.bookHotelBtn}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Alternative Hotels Drawer */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Alternative Hotel Recommendations
          </h4>
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs hover:bg-slate-100/80 transition"
            >
              <div>
                <span className="font-bold text-slate-900">{alt.name}</span>
                <div className="text-[11px] text-slate-500">
                  {alt.rating}/10 • {formatPrice(alt.pricePerNight, alt.currency, language)}/night • {alt.address.split(',')[0]}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">
                  {formatPrice(alt.totalPrice, alt.currency, language)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectHotel(alt);
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
