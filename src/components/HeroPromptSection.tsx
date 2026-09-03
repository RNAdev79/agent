import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plane,
  Building2,
  Calendar,
  MapPin,
  Send,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/i18n';
import { UserInputPlanRequest } from '../../types/index';
import { useCurrency } from '../context/CurrencyContext';

interface HeroPromptSectionProps {
  language: Language;
  currency?: string;
  onGenerate: (data: UserInputPlanRequest) => void;
  isLoading: boolean;
}

export const HeroPromptSection: React.FC<HeroPromptSectionProps> = ({
  language,
  currency: propCurrency,
  onGenerate,
  isLoading,
}) => {
  const t = TRANSLATIONS[language];
  const { currency: contextCurrency, currencySymbol, formatPrice } = useCurrency();
  const activeCurrency = propCurrency || contextCurrency;

  // Form states
  const [promptText, setPromptText] = useState('');
  const [destination, setDestination] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [durationDays, setDurationDays] = useState(6);
  // Hotel budget is DAILY (e.g. 600 SAR or $160 USD)
  const [dailyHotelBudget, setDailyHotelBudget] = useState(activeCurrency === 'SAR' ? 600 : 160);
  const [flightBudget, setFlightBudget] = useState(activeCurrency === 'SAR' ? 800 : 450);
  const [travelStyle, setTravelStyle] = useState<
    'balanced' | 'luxury' | 'cultural' | 'foodie' | 'adventure' | 'romantic'
  >('balanced');
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Auto-adjust default slider values if currency switches between SAR/USD
  useEffect(() => {
    if (activeCurrency === 'SAR') {
      if (dailyHotelBudget < 150) setDailyHotelBudget(600);
      if (flightBudget < 400) setFlightBudget(800);
    } else if (activeCurrency === 'USD') {
      if (dailyHotelBudget > 1000) setDailyHotelBudget(160);
      if (flightBudget > 1500) setFlightBudget(500);
    }
  }, [activeCurrency]);

  // Preset example chips
  const applyPreset = (preset: {
    dest: string;
    origin: string;
    days: number;
    flight: number;
    hotel: number;
    style: any;
    prompt: string;
  }) => {
    setDestination(preset.dest);
    setOriginCity(preset.origin);
    setDurationDays(preset.days);
    setFlightBudget(preset.flight);
    setDailyHotelBudget(preset.hotel);
    setTravelStyle(preset.style);
    setPromptText(preset.prompt);
  };

  const calculatedTotalHotel = dailyHotelBudget * durationDays;
  const estimatedDailyActivities = activeCurrency === 'SAR' ? 150 : 45;
  const calculatedTotalActivities = estimatedDailyActivities * durationDays;
  const calculatedTotalTrip = flightBudget + calculatedTotalHotel + calculatedTotalActivities;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt: promptText.trim() || undefined,
      destination: destination.trim() || undefined,
      originCity: originCity.trim() || (language === 'ar' ? 'JED' : 'JFK'),
      durationDays,
      flightBudget,
      hotelBudget: dailyHotelBudget, // Nightly rate sent to Booking.com
      daily_hotel_budget: dailyHotelBudget,
      total_hotel_budget: calculatedTotalHotel,
      daily_activities_budget: estimatedDailyActivities,
      total_activities_budget: calculatedTotalActivities,
      total_trip_budget: calculatedTotalTrip,
      currency: activeCurrency,
      travelStyle: travelStyle as any,
    });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/40 blur-3xl" />
      <div className="absolute top-1/3 right-10 -z-10 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero Title & Value Proposition */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-700 shadow-2xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl font-sans">
            {language === 'ar' ? (
              <>
                خطط لرحلتك المثالية{' '}
                <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                  بالذكاء الاصطناعي
                </span>{' '}
                والتوزيع المكاني
              </>
            ) : (
              <>
                Plan Your Perfect Journey With{' '}
                <span className="bg-gradient-to-r from-sky-500 to-sky-600 bg-clip-text text-transparent">
                  Spatial Intelligence
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            {t.heroDesc}
          </p>
        </div>

        {/* Preset Prompt Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">
            {t.quickExamples}
          </span>
          <button
            type="button"
            id="preset-riyadh"
            onClick={() =>
              applyPreset({
                dest: 'Riyadh',
                origin: 'JED',
                days: 6,
                flight: 500,
                hotel: 600,
                style: 'balanced',
                prompt:
                  language === 'ar'
                    ? 'عندي رحلة 6 ايام للرياض ميزانيته الطيران 500 وميزانيته السكن 600'
                    : 'Trip to Riyadh for 6 days with flight budget 500 and hotel budget 600.',
              })
            }
            className="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-2xs hover:bg-sky-100 transition cursor-pointer"
          >
            🇸🇦 {language === 'ar' ? 'الرياض (6 أيام - 500/600)' : 'Riyadh (6 Days - 500/600)'}
          </button>
          <button
            type="button"
            id="preset-tokyo"
            onClick={() =>
              applyPreset({
                dest: 'Tokyo',
                origin: 'JFK',
                days: 4,
                flight: 750,
                hotel: 950,
                style: 'cultural',
                prompt:
                  language === 'ar'
                    ? 'رحلة 4 أيام في طوكيو بميزانية طيران 750$ وفندق 950$. زيارة معبد سينسوجي، رامن أفوكي، برج شيبويا سكاي، وسوشي جينزا.'
                    : '4 days in Tokyo under $1700 budget. Shrines, authentic ramen, Shibuya Sky view, and Tsukiji morning food market.',
              })
            }
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:bg-sky-50/50 transition cursor-pointer"
          >
            {t.exTokyo}
          </button>
          <button
            type="button"
            id="preset-paris"
            onClick={() =>
              applyPreset({
                dest: 'Paris',
                origin: 'JFK',
                days: 3,
                flight: 650,
                hotel: 750,
                style: 'romantic',
                prompt:
                  language === 'ar'
                    ? 'عطلة رومانسية 3 أيام في باريس مع برج إيفل، متحف اللوفر، ومقاهي سان جيرمان الباريسية.'
                    : 'Romantic 3 days in Paris with Eiffel Tower, Louvre museum, and authentic Saint-Germain cafes.',
              })
            }
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:bg-sky-50/50 transition cursor-pointer"
          >
            {t.exParis}
          </button>
          <button
            type="button"
            id="preset-dubai"
            onClick={() =>
              applyPreset({
                dest: 'Dubai',
                origin: 'LHR',
                days: 5,
                flight: 600,
                hotel: 1100,
                style: 'luxury',
                prompt:
                  language === 'ar'
                    ? 'رحلة فاخرة 5 أيام في دبي، تشمل برج خليفة، مارينا دبي، نخلة جميرا، ومطاعم شاطئية راقية.'
                    : 'Luxury 5 days in Dubai with Burj Khalifa, Palm Jumeirah, Dubai Marina yacht walk, and beachfront dining.',
              })
            }
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:bg-sky-50/50 transition cursor-pointer"
          >
            {t.exDubai}
          </button>
          <button
            type="button"
            id="preset-rome"
            onClick={() =>
              applyPreset({
                dest: 'Rome',
                origin: 'JFK',
                days: 4,
                flight: 550,
                hotel: 700,
                style: 'cultural',
                prompt:
                  language === 'ar'
                    ? 'رحلة 4 أيام في روما التاريخية لاستكشاف الكولوسيوم والفاتيكان وتذوق الباستا والجيلاتو الإيطالي.'
                    : '4 days in historic Rome exploring the Colosseum, Vatican, artisan pasta trattorias, and Piazza Navona.',
              })
            }
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:bg-sky-50/50 transition cursor-pointer"
          >
            {t.exRome}
          </button>
        </div>

        {/* Main Prompt Form & Sliders Container */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm"
        >
          {/* Natural Language Prompt Area */}
          <div className="relative">
            <label
              htmlFor="travel-prompt-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
            >
              {language === 'ar'
                ? 'وصف الرحلة أو الطلب الطبيعي (DeepSeek NLU)'
                : 'Natural Language Travel Request (DeepSeek NLU)'}
            </label>
            <textarea
              id="travel-prompt-input"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-sky-100 transition text-sm sm:text-base leading-relaxed"
            />
          </div>

          {/* Quick toggle for parameter sliders */}
          <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-sky-500" />
              {language === 'ar'
                ? 'معايير الميزانية والوجهة التفصيلية'
                : 'Budget & Destination Controls'}
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
            >
              {showAdvanced
                ? language === 'ar'
                  ? 'إخفاء'
                  : 'Hide controls'
                : language === 'ar'
                ? 'تخصيص المعايير'
                : 'Customize parameters'}
            </button>
          </div>

          {showAdvanced && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Destination Override */}
              <div>
                <label
                  htmlFor="dest-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span>{t.destinationLabel}</span>
                </label>
                <input
                  id="dest-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Tokyo, Paris, Dubai"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Origin City / Airport */}
              <div>
                <label
                  htmlFor="origin-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <Plane className="h-3.5 w-3.5 text-sky-500" />
                  <span>{t.originLabel}</span>
                </label>
                <input
                  id="origin-input"
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder="e.g. JFK, LHR, DXB, RUH"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Travel Style */}
              <div>
                <label
                  htmlFor="travel-style-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <Compass className="h-3.5 w-3.5 text-sky-500" />
                  <span>{t.travelStyleLabel}</span>
                </label>
                <select
                  id="travel-style-select"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="balanced">{t.styles.balanced}</option>
                  <option value="luxury">{t.styles.luxury}</option>
                  <option value="cultural">{t.styles.cultural}</option>
                  <option value="foodie">{t.styles.foodie}</option>
                  <option value="adventure">{t.styles.adventure}</option>
                  <option value="romantic">{t.styles.romantic}</option>
                </select>
              </div>

              {/* Duration Slider */}
              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="duration-slider"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Calendar className="h-3.5 w-3.5 text-sky-500" />
                    <span>{t.durationLabel}</span>
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded">
                    {durationDays} {language === 'ar' ? 'أيام' : 'Days'} (K={durationDays})
                  </span>
                </div>
                <input
                  id="duration-slider"
                  type="range"
                  min={1}
                  max={10}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 day</span>
                  <span>5 days</span>
                  <span>10 days</span>
                </div>
              </div>

              {/* Flight Budget Slider */}
              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="flight-budget-slider"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Plane className="h-3.5 w-3.5 text-sky-500" />
                    <span>{t.flightBudgetLabel}</span>
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded">
                    {currencySymbol}
                    {flightBudget}
                  </span>
                </div>
                <input
                  id="flight-budget-slider"
                  type="range"
                  min={250}
                  max={3000}
                  step={50}
                  value={flightBudget}
                  onChange={(e) => setFlightBudget(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>{currencySymbol}250</span>
                  <span>{currencySymbol}1,500</span>
                  <span>{currencySymbol}3,000+</span>
                </div>
              </div>

              {/* Hotel Budget Slider (Daily Rate) */}
              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="hotel-budget-slider"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                  >
                    <Building2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>{t.hotelBudgetLabel}</span>
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded">
                    {formatPrice(dailyHotelBudget, activeCurrency, language)} / {language === 'ar' ? 'ليلة' : 'night'}
                  </span>
                </div>
                <input
                  id="hotel-budget-slider"
                  type="range"
                  min={activeCurrency === 'SAR' ? 150 : 40}
                  max={activeCurrency === 'SAR' ? 2500 : 700}
                  step={activeCurrency === 'SAR' ? 25 : 10}
                  value={dailyHotelBudget}
                  onChange={(e) => setDailyHotelBudget(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>
                    {language === 'ar' ? 'إجمالي السكن لـ ' : 'Total for '}
                    {durationDays} {language === 'ar' ? 'ليالٍ: ' : 'nights: '}
                    <strong className="text-slate-800">
                      {formatPrice(calculatedTotalHotel, activeCurrency, language)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Live Dynamic Budget Summary Banner */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-600">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-sky-500" />
                {language === 'ar' ? 'حساب الميزانية التقديرية:' : 'Calculated Trip Budget:'}
              </span>
              <span>
                {language === 'ar' ? 'طيران: ' : 'Flight: '}
                <strong>{formatPrice(flightBudget, activeCurrency, language)}</strong>
              </span>
              <span>•</span>
              <span>
                {language === 'ar' ? 'سكن: ' : 'Hotel: '}
                <strong>
                  {formatPrice(dailyHotelBudget, activeCurrency, language)} × {durationDays} ={' '}
                  {formatPrice(calculatedTotalHotel, activeCurrency, language)}
                </strong>
              </span>
              <span>•</span>
              <span>
                {language === 'ar' ? 'أنشطة وطعام: ' : 'Activities: '}
                <strong>{formatPrice(calculatedTotalActivities, activeCurrency, language)}</strong>
              </span>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="text-slate-500 text-[11px] block">
                {language === 'ar' ? 'الإجمالي التقديري الكامل' : 'Total Est. Trip Budget'}
              </span>
              <span className="text-base font-black text-slate-900">
                {formatPrice(calculatedTotalTrip, activeCurrency, language)}
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-6 flex items-center justify-end">
            <button
              id="submit-plan-btn"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:opacity-60 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Zap className="h-5 w-5 animate-spin text-sky-400" />
                  <span>{t.generatingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-sky-400" />
                  <span>{t.generateBtn}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feature badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3 text-xs font-medium text-slate-600 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Strict Budget Control & Live Fare Verification</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3 text-xs font-medium text-slate-600 shadow-2xs">
            <Compass className="h-4 w-4 text-sky-500" />
            <span>K-Means Clustering: Zero Backtracking</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3 text-xs font-medium text-slate-600 shadow-2xs">
            <MapPin className="h-4 w-4 text-slate-700" />
            <span>Direct Google Maps Directions & Booking Links</span>
          </div>
        </div>
      </div>
    </section>
  );
};
