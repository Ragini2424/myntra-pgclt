import React, { useRef } from 'react';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../ProductCard';
import { getTopFitsForFestival } from '../../utils/festiveMatcher';
import { Sparkles, ChevronLeft, ChevronRight, Calendar, Flame } from 'lucide-react';

export function FestiveShelf() {
  const { city, state, festivals, isFetchingEditorial } = useCityTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  // Identify active primary festival or season name
  const primaryFestival = festivals && festivals.length > 0 ? festivals[0] : {
    name: `${state} Festive Celebration`,
    dateRange: 'Upcoming Season',
    culturalNote: `Vibrant festive ethnic wear and traditional attire tailored for celebrations across ${state}.`
  };
  const festivalTitle = primaryFestival?.name ? `${primaryFestival.name} Top Fits` : `Festive Picks for ${state}`;

  // Automatically match top fits from catalog for the pulled regional festival
  const matchedFits = getTopFitsForFestival(primaryFestival, state, PRODUCTS, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (matchedFits.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 mt-6 mb-8">
      {/* Outer Festive Shelf Container */}
      <div 
        className="rounded-3xl p-5 sm:p-7 border-2 shadow-sm transition-all duration-500 relative overflow-hidden"
        style={{
          borderColor: `${accent.primary}50`,
          backgroundColor: accent.bg || '#FFFBEB'
        }}
      >
        {/* Shelf Background Accent Blur */}
        <div 
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ backgroundColor: accent.primary }}
        />

        {/* Shelf Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-200/80 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: accent.primary }}
              >
                <Sparkles className="w-3 h-3 text-white" />
                Festival Special
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300/60">
                <Flame className="w-3 h-3 text-amber-600" />
                Trending for {city}
              </span>

              {primaryFestival?.dateRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-gray-700 bg-white/80 border border-gray-200">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  {primaryFestival.dateRange}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              🎉 {festivalTitle}
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Handpicked ethnic & festive styles curated specifically for celebrations in {city}, {state}.
            </p>
          </div>

          {/* Navigation Scroll Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-amber-400 active:scale-95 transition-all flex items-center justify-center shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-amber-400 active:scale-95 transition-all flex items-center justify-center shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Products Shelf */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1 relative z-10"
        >
          {isFetchingEditorial ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="snap-start min-w-[240px] sm:min-w-[280px] max-w-[280px] shrink-0 h-80 bg-white/60 animate-pulse rounded-2xl border border-gray-200/60"
              />
            ))
          ) : (
            matchedFits.map(({ product, matchScore, matchedFestivalName, matchReason }) => (
              <div 
                key={product.id} 
                className="snap-start min-w-[240px] sm:min-w-[280px] max-w-[280px] shrink-0"
              >
                <ProductCard 
                  product={product} 
                  festiveMatchBadge={{
                    score: matchScore,
                    festivalName: matchedFestivalName,
                    reason: matchReason
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
