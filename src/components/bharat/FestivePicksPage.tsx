import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../ProductCard';
import { BharatBreadcrumbs } from './BharatBreadcrumbs';
import { STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { getTopFitsForFestival } from '../../utils/festiveMatcher';
import { Sparkles, ArrowLeft, Search } from 'lucide-react';

interface FestivePicksPageProps {
  festivalName: string;
  state: string;
  city: string;
  onNavigateHome: () => void;
  onNavigateCity: (cityName: string) => void;
  onNavigateFestivals: (cityName: string) => void;
}

export function FestivePicksPage({
  festivalName,
  state,
  city,
  onNavigateHome,
  onNavigateCity,
  onNavigateFestivals,
}: FestivePicksPageProps) {
  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  // Filter States
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('regional');

  // Compute matched festival fits specifically for this festival
  const displayFits = useMemo(() => {
    const festItem = {
      name: festivalName,
      dateRange: 'Upcoming Season',
      culturalNote: `Curated top fits and festive wear for ${festivalName} in ${state}.`
    };

    let list = getTopFitsForFestival(festItem, state, PRODUCTS, 20);

    if (selectedGender !== 'all') {
      list = list.filter(item => item.product.gender.toLowerCase() === selectedGender.toLowerCase() || item.product.gender === 'unisex');
    }

    if (selectedCategory !== 'all') {
      list = list.filter(item => item.product.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedBrand !== 'all') {
      list = list.filter(item => item.product.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (priceRange !== 'all') {
      if (priceRange === 'under1000') list = list.filter(item => item.product.price < 1000);
      else if (priceRange === '1000-2500') list = list.filter(item => item.product.price >= 1000 && item.product.price <= 2500);
      else if (priceRange === '2500-5000') list = list.filter(item => item.product.price >= 2500 && item.product.price <= 5000);
      else if (priceRange === 'above5000') list = list.filter(item => item.product.price > 5000);
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.product.price - b.product.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.product.price - a.product.price);
    } else {
      list.sort((a, b) => b.matchScore - a.matchScore);
    }

    return list;
  }, [festivalName, state, selectedGender, selectedCategory, selectedBrand, priceRange, sortBy]);

  const resetAllFilters = () => {
    setSelectedGender('all');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange('all');
    setSortBy('regional');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Breadcrumbs */}
      <BharatBreadcrumbs
        items={[
          { label: `${city}, ${state}`, onClick: () => onNavigateCity(city) },
          { label: 'Festivals', onClick: () => onNavigateFestivals(city) },
          { label: festivalName }
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
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>Festive Edit</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            {festivalName} Specials in {state}
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 font-medium max-w-xl">
            Explore silk sarees, hand-embroidered kurtas, and traditional footwear curated specifically for celebrations in {state}.
          </p>

          <button
            onClick={() => onNavigateFestivals(city)}
            className="mt-2 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg backdrop-blur-md transition-all inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Festival Carousel</span>
          </button>
        </div>

        {/* Decorative Badge */}
        <div className="hidden md:flex items-center justify-center w-36 h-36 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center p-4">
          <span className="text-4xl">🪔</span>
        </div>
      </div>

      {/* Main Catalog View */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="text-xs font-bold text-gray-800">
            Showing <span className="text-[#F13AB1]">{displayFits.length} matched top fits</span> for {festivalName}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg text-xs font-bold px-3 py-1.5 outline-none focus:border-[#F13AB1] text-[#29303E]"
            >
              <option value="regional">Popularity in {state}</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
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
                    name="festive_gender"
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
                { id: 'footwear', label: 'Footwear & Juttis' },
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
                    name="festive_price"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="accent-[#F13AB1]"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {displayFits.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
                <p className="text-sm font-bold text-gray-700">No matched fits found for the selected filter criteria.</p>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-[#F13AB1] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Reset Filters
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
                        reason: matchReason
                      }}
                    />
                    <div className="mt-1 px-2 py-0.5 bg-amber-50 text-amber-900 text-[10px] font-bold rounded border border-amber-200/60 truncate">
                      ✨ {matchReason}
                    </div>
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
