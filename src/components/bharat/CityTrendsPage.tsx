import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../ProductCard';
import { BharatBreadcrumbs } from './BharatBreadcrumbs';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { TrendingUp, ArrowLeft, Flame } from 'lucide-react';

interface CityTrendsPageProps {
  city: string;
  onNavigateHome: () => void;
  onNavigateCity: (cityName: string) => void;
}

export function CityTrendsPage({
  city,
  onNavigateHome,
  onNavigateCity,
}: CityTrendsPageProps) {
  const { state } = useCityTheme();
  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  // Filter States
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  // Compute products sorted by local relevance and purchase count
  const displayProducts = useMemo(() => {
    let list = [...PRODUCTS];

    if (selectedGender !== 'all') {
      list = list.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase() || p.gender === 'unisex');
    }

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (priceRange !== 'all') {
      if (priceRange === 'under1000') list = list.filter(p => p.price < 1000);
      else if (priceRange === '1000-2500') list = list.filter(p => p.price >= 1000 && p.price <= 2500);
      else if (priceRange === '2500-5000') list = list.filter(p => p.price >= 2500 && p.price <= 5000);
      else if (priceRange === 'above5000') list = list.filter(p => p.price > 5000);
    }

    // Prioritize products matching the current state/city
    const stateMatches = list.filter(p => 
      p.region_relevance.some(r => r.toLowerCase() === state.toLowerCase())
    );
    const otherItems = list.filter(p => 
      !p.region_relevance.some(r => r.toLowerCase() === state.toLowerCase())
    );

    stateMatches.sort((a, b) => b.local_purchase_count - a.local_purchase_count);
    otherItems.sort((a, b) => b.local_purchase_count - a.local_purchase_count);

    return [...stateMatches, ...otherItems];
  }, [state, selectedGender, selectedCategory, priceRange]);

  const resetAllFilters = () => {
    setSelectedGender('all');
    setSelectedCategory('all');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Breadcrumbs */}
      <BharatBreadcrumbs
        items={[
          { label: `${city}, ${state}`, onClick: () => onNavigateCity(city) },
          { label: 'Trends' }
        ]}
        onHomeClick={onNavigateHome}
      />

      {/* Small Hero Banner (200-300px height) */}
      <div 
        className="w-full relative h-60 sm:h-72 overflow-hidden flex items-center justify-between px-6 sm:px-12 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${accent.primary} 0%, #111827 100%)`
        }}
      >
        <div className="max-w-2xl z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Hyper-Local Trends</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            Trending in {city} & Nearby Cities
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 font-medium max-w-xl">
            Real-time popular fashion, top-selling ethnic wear, and daily essentials purchased by shoppers in {city}, {state}.
          </p>

          <button
            onClick={() => onNavigateCity(city)}
            className="mt-2 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg backdrop-blur-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {city} Experience</span>
          </button>
        </div>

        {/* Decorative Badge */}
        <div className="hidden md:flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center p-4">
          <TrendingUp className="w-10 h-10 text-amber-300 mb-1" />
          <span className="text-[11px] font-black uppercase tracking-wider text-white">Top Demands</span>
        </div>
      </div>

      {/* Main Catalog View */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-bold text-gray-800">
            Showing <span className="text-[#F13AB1]">{displayProducts.length} trending items</span> in {city}
          </div>
          <div className="text-xs font-bold text-gray-500 italic">
            Sorted by local purchase count (Highest First)
          </div>
        </div>

        {/* Sidebar & Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Sidebar Filter */}
          <aside className="w-full md:w-60 lg:w-64 shrink-0 bg-white p-4 rounded-xl border border-gray-200/90 h-fit space-y-6 text-xs text-[#29303E]">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-black uppercase tracking-wider text-sm text-[#29303E]">FILTERS</h3>
              <button onClick={resetAllFilters} className="font-bold text-[#F13AB1] hover:underline text-[11px]">
                CLEAR ALL
              </button>
            </div>

            {/* Gender */}
            <div className="border-b border-gray-200 pb-4 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">GENDER</h4>
              {['all', 'men', 'women', 'kids'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer hover:text-[#F13AB1] font-medium capitalize">
                  <input
                    type="radio"
                    name="trend_gender"
                    checked={selectedGender === g}
                    onChange={() => setSelectedGender(g)}
                    className="accent-[#F13AB1]"
                  />
                  <span>{g === 'all' ? 'All Genders' : g}</span>
                </label>
              ))}
            </div>

            {/* Categories */}
            <div className="border-b border-gray-200 pb-4 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">CATEGORY</h4>
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'ethnic wear', label: 'Ethnic Wear' },
                { id: 'western wear', label: 'Western Wear' },
                { id: 'footwear', label: 'Footwear & Shoes' },
                { id: 'accessories', label: 'Accessories' }
              ].map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:text-[#F13AB1] font-medium">
                  <input
                    type="checkbox"
                    checked={selectedCategory === c.id}
                    onChange={() => setSelectedCategory(selectedCategory === c.id ? 'all' : c.id)}
                    className="accent-[#F13AB1] rounded"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">PRICE</h4>
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under1000', label: 'Under ₹1,000' },
                { id: '1000-2500', label: '₹1,000 to ₹2,500' },
                { id: '2500-5000', label: '₹2,500 to ₹5,000' },
                { id: 'above5000', label: 'Above ₹5,000' }
              ].map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:text-[#F13AB1] font-medium">
                  <input
                    type="radio"
                    name="trend_price"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="accent-[#F13AB1]"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Product Grid with "Trending in {City}" Badge */}
          <div className="flex-1">
            {displayProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
                <p className="text-sm font-bold text-gray-700">No trending products match your filter.</p>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-[#F13AB1] text-white rounded-lg text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayProducts.map(product => (
                  <div key={product.id} className="relative group">
                    
                    {/* Requirement 7: Add small badge on cards: "Trending in [City]" */}
                    <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md pointer-events-none">
                      <Flame className="w-2.5 h-2.5 fill-amber-300" />
                      <span>Trending in {city}</span>
                    </div>

                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
