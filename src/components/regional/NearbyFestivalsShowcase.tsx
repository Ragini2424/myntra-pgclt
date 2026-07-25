import React, { useState, useMemo } from 'react';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../ProductCard';
import { getAllRegionalFestiveFits, getTopFitsForFestival } from '../../utils/festiveMatcher';
import { Sparkles, Calendar, Filter, Flame, CheckCircle2, Compass, Layers } from 'lucide-react';

interface NearbyFestivalsShowcaseProps {
  onSelectCategory?: (category: string) => void;
}

export function NearbyFestivalsShowcase({ onSelectCategory }: NearbyFestivalsShowcaseProps) {
  const { city, state, festivals, isFetchingEditorial } = useCityTheme();
  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  // Selected Festival Tab: 'all' or specific festival name
  const [selectedFestivalTab, setSelectedFestivalTab] = useState<string>('all');
  
  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Compute all regional festive fits automatically pulled for the region
  const { matchedFits, festivalFitsMap } = useMemo(() => {
    // If context festivals are empty or loading, provide structured fallback regional festivals for the state
    const activeFestivals = festivals && festivals.length > 0 ? festivals : [
      {
        name: `${state} Festive & Cultural Season`,
        dateRange: 'Upcoming Regional Window',
        culturalNote: `Traditional ethnic drapes, handloom silks, and handcrafted footwear curated for celebrations in ${state}.`
      }
    ];

    return getAllRegionalFestiveFits(activeFestivals, state, PRODUCTS);
  }, [festivals, state]);

  // Filter products based on selected festival tab & category
  const displayFits = useMemo(() => {
    let list = matchedFits;

    if (selectedFestivalTab !== 'all') {
      list = festivalFitsMap[selectedFestivalTab] || [];
    }

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.product.category === selectedCategory);
    }

    return list;
  }, [matchedFits, festivalFitsMap, selectedFestivalTab, selectedCategory]);

  const activeFestivalObj = useMemo(() => {
    if (selectedFestivalTab === 'all' || !festivals) return null;
    return festivals.find((f) => f.name === selectedFestivalTab) || null;
  }, [selectedFestivalTab, festivals]);

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 my-8">
      <div 
        className="rounded-3xl p-5 sm:p-8 border-2 shadow-sm transition-all duration-500 relative overflow-hidden bg-white"
        style={{
          borderColor: `${accent.primary}40`,
        }}
      >
        {/* Subtle Background Accent Gradient */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: accent.primary }}
        />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: accent.primary }}
              >
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                Automated Regional Festival Matcher
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200">
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                {city}, {state}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Showcase Only Matched Fits
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              🎉 Nearby Regional Festivals & Top Fits
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Automatically pulling upcoming celebrations for <strong className="text-gray-900">{city}, {state}</strong> and matching top ethnic, footwear, & accessory fits directly from our catalog.
            </p>
          </div>

          {/* Right Info Box */}
          <div className="flex items-center gap-3 shrink-0 bg-orange-50/80 border border-orange-200 p-3 rounded-2xl text-xs">
            <Flame className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">Catalogue Filter Active</div>
              <div className="text-[11px] text-gray-600">Showing strictly matched fits for {state}'s festive calendar</div>
            </div>
          </div>
        </div>

        {/* Festival Tabs Bar */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1.5 text-gray-900 uppercase tracking-wider text-[11px]">
              <Calendar className="w-4 h-4 text-[#F13AB1]" />
              Pulled Regional Festivals ({festivals?.length || 1}):
            </span>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-gray-400 font-semibold mr-1 hidden sm:inline">Filter Category:</span>
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'ethnic wear', label: 'Ethnic Wear' },
                { id: 'footwear', label: 'Footwear & Juttis' },
                { id: 'accessories', label: 'Jewelry & Accessories' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Festival Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedFestivalTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedFestivalTab === 'all'
                  ? 'bg-[#F13AB1] text-white shadow-md scale-102'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Nearby Festivals ({matchedFits.length} Top Fits)</span>
            </button>

            {festivals?.map((fest) => {
              const count = (festivalFitsMap[fest.name] || []).length;
              return (
                <button
                  key={fest.name}
                  onClick={() => setSelectedFestivalTab(fest.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                    selectedFestivalTab === fest.name
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}
                >
                  <span>🪔 {fest.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    selectedFestivalTab === fest.name ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count} fits
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Festival Details Banner (if specific festival selected) */}
        {activeFestivalObj && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeFestivalObj.name} ({activeFestivalObj.dateRange})</span>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                {activeFestivalObj.culturalNote}
              </p>
            </div>
            <div className="shrink-0 text-xs font-black text-amber-800 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-300">
              Matched Top Fits: {displayFits.length}
            </div>
          </div>
        )}

        {/* Product Grid - Showcase ONLY Matched Fits */}
        <div className="mt-6">
          {isFetchingEditorial ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
              ))}
            </div>
          ) : displayFits.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <p className="text-sm font-bold text-gray-700">No matched fits found for the selected category filter.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-[#F13AB1] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Show All Matched Festival Fits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayFits.map(({ product, matchScore, matchedFestivalName, matchReason }) => (
                <div key={product.id} className="flex flex-col">
                  <ProductCard
                    product={product}
                    festiveMatchBadge={{
                      score: matchScore,
                      festivalName: matchedFestivalName,
                      reason: matchReason,
                    }}
                  />
                  {/* Matching Reason Tag underneath card */}
                  <div className="mt-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center justify-between">
                    <span className="truncate">✨ {matchReason}</span>
                    <span className="shrink-0 text-emerald-700 font-extrabold">{matchScore}% Fit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
