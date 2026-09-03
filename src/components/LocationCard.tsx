import React from 'react';
import {
  Coffee,
  Compass,
  Utensils,
  Landmark,
  Wine,
  Star,
  MapPin,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { PlaceItem, PlaceCategory } from '../../types/index';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface LocationCardProps {
  place: PlaceItem;
  stopNumber: number;
  language: Language;
}

const CATEGORY_CONFIG: Record<
  PlaceCategory,
  {
    icon: React.ElementType;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  breakfast: {
    icon: Coffee,
    badgeBg: 'bg-amber-50 border-amber-200/80',
    badgeText: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
  activity: {
    icon: Compass,
    badgeBg: 'bg-blue-50 border-blue-200/80',
    badgeText: 'text-blue-800',
    dotColor: 'bg-blue-500',
  },
  lunch: {
    icon: Utensils,
    badgeBg: 'bg-emerald-50 border-emerald-200/80',
    badgeText: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  attraction: {
    icon: Landmark,
    badgeBg: 'bg-purple-50 border-purple-200/80',
    badgeText: 'text-purple-800',
    dotColor: 'bg-purple-500',
  },
  dinner: {
    icon: Wine,
    badgeBg: 'bg-rose-50 border-rose-200/80',
    badgeText: 'text-rose-800',
    dotColor: 'bg-rose-500',
  },
};

export const LocationCard: React.FC<LocationCardProps> = ({
  place,
  stopNumber,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const config = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.activity;
  const CategoryIcon = config.icon;
  const categoryLabel =
    t.categories[place.category] || t.categories.activity;

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Photo thumbnail */}
        {place.photoUrl && (
          <div className="relative h-40 sm:h-32 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
            <img
              src={place.photoUrl}
              alt={place.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/85 text-[11px] font-bold text-white shadow-xs">
              {stopNumber}
            </div>
          </div>
        )}

        {/* Content details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Category badge & Time slot */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                <span>{categoryLabel}</span>
              </span>

              {place.timeSlot && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{place.timeSlot}</span>
                </span>
              )}
            </div>

            {/* Name */}
            <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
              {place.name}
            </h4>

            {/* Ratings & Price Level */}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating}</span>
                <span className="font-normal text-slate-400">
                  ({place.reviewsCount?.toLocaleString()} reviews)
                </span>
              </div>

              {place.priceLevel && (
                <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  {place.priceLevel}
                </span>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {place.description}
              </p>
            )}
          </div>

          {/* Footer with Address, GPS coords and Google Maps Link */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1 max-w-[250px]">{place.address}</span>
              <span className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </span>
            </div>

            <a
              id={`place-maps-btn-${place.id}`}
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition cursor-pointer"
            >
              <span>{t.openPlaceMaps}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
