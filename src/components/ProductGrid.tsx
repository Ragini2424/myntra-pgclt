import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';
import { SearchIntent } from '../types';
import { useCityTheme } from '../contexts/CityThemeContext';
import { Search, ChevronDown, Sparkles, XCircle, MapPin } from 'lucide-react';

interface ProductGridProps {
  searchIntentResult: { intent: SearchIntent; rawQuery: string } | null;
  onClearSearch: () => void;
  isBharatMode?: boolean;
}

function normalizeCategoryName(catName: string): string | null {
  const c = catName.toLowerCase().trim();
  if (!c || c === 'all' || c === 'home') return null;
  if (c.includes('ethnic') || c.includes('kurta') || c.includes('saree') || c.includes('suit') || c.includes('lehenga') || c.includes('sherwani') || c.includes('paithani') || c.includes('banarasi') || c.includes('kanjeevaram') || c.includes('bandhani') || c.includes('phulkari')) {
    return 'ethnic wear';
  }
  if (c.includes('western') || c.includes('casual') || c.includes('active') || c.includes('sport') || c.includes('loungewear') || c.includes('innerwear') || c.includes('lingerie') || c.includes('shirt') || c.includes('jean') || c.includes('blazer') || c.includes('dress') || c.includes('hoodie')) {
    return 'western wear';
  }
  if (c.includes('footwear') || c.includes('shoe') || c.includes('jutti') || c.includes('mojari') || c.includes('kolhapuri') || c.includes('sandal') || c.includes('sneaker') || c.includes('boot') || c.includes('loafer') || c.includes('chappal')) {
    return 'footwear';
  }
  if (c.includes('accessory') || c.includes('accessories') || c.includes('watch') || c.includes('grooming') || c.includes('beauty') || c.includes('jewelry') || c.includes('jhumka') || c.includes('bag') || c.includes('potli') || c.includes('sunglass') || c.includes('wallet') || c.includes('kundan')) {
    return 'accessories';
  }
  return null;
}

export function ProductGrid({ searchIntentResult, onClearSearch, isBharatMode = false }: ProductGridProps) {
  const { city, state } = useCityTheme();

  // Filter States
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('regional');

  // Reset sidebar filters when search query changes so filters don't block search results
  useEffect(() => {
    if (searchIntentResult) {
      setSelectedGender('all');
      setSelectedCategory('all');
      setSelectedBrand('all');
      setSelectedOccasion('all');
      setPriceRange('all');
    }
  }, [searchIntentResult]);

  // Categories list with counts
  const categoryCounts = useMemo(() => {
    return {
      'Ethnic Wear': PRODUCTS.filter(p => p.category === 'ethnic wear').length,
      'Western Wear': PRODUCTS.filter(p => p.category === 'western wear').length,
      'Footwear': PRODUCTS.filter(p => p.category === 'footwear').length,
      'Accessories': PRODUCTS.filter(p => p.category === 'accessories').length,
    };
  }, []);

  // Brands list with counts
  const brandsList = useMemo(() => {
    const map = new Map<string, number>();
    PRODUCTS.forEach(p => {
      map.set(p.brand, (map.get(p.brand) || 0) + 1);
    });
    return Array.from(map.entries()).map(([brand, count]) => ({ brand, count }));
  }, []);

  // Compute sorted & filtered products
  const { displayProducts, stateMatchCount } = useMemo(() => {
    let list = [...PRODUCTS];

    // 1. Filter / Score by AI Search Intent if present
    if (searchIntentResult?.intent) {
      const intent = searchIntentResult.intent;
      const rawQuery = searchIntentResult.rawQuery.toLowerCase().trim();

      // Check if raw query or intent category maps strictly to a top-level category
      const targetCategory = 
        (intent.category && intent.category.toLowerCase() !== 'all' ? normalizeCategoryName(intent.category) : null) ||
        normalizeCategoryName(rawQuery);

      const rawWords = rawQuery.split(/\s+/).filter(w => w.length > 1 && w !== 'wear' && w !== 'clothing');

      // Collect keyword tokens (excluding generic terms like 'wear')
      const searchTokens = new Set<string>();
      rawWords.forEach(w => searchTokens.add(w));
      if (intent.keywords) {
        intent.keywords.forEach(kw => {
          kw.toLowerCase().split(/\s+/).forEach(w => {
            if (w.length > 1 && w !== 'wear' && w !== 'clothing') searchTokens.add(w);
          });
        });
      }

      // Determine target gender from intent or query
      let targetGender: string | null = null;
      if (intent.gender && intent.gender.toLowerCase() !== 'all') {
        targetGender = intent.gender.toLowerCase();
      } else if (rawQuery.includes('men') && !rawQuery.includes('women')) {
        targetGender = 'men';
      } else if (rawQuery.includes('women')) {
        targetGender = 'women';
      } else if (rawQuery.includes('kids')) {
        targetGender = 'kids';
      }

      // Calculate keyword relevance score for every product
      const scored = list.map(p => {
        let score = 0;
        const nameL = p.name.toLowerCase();
        const brandL = p.brand.toLowerCase();
        const catL = p.category.toLowerCase();
        const tagsL = p.styleTags.map(t => t.toLowerCase());
        const trendL = p.local_trending_tag.toLowerCase();
        const textSearchSpace = `${p.name} ${p.brand} ${p.category} ${p.occasion} ${p.color} ${p.gender} ${p.styleTags.join(' ')} ${p.local_trending_tag} ${p.region_relevance ? p.region_relevance.join(' ') : ''}`.toLowerCase();

        // Direct full query match in product name gets highest priority
        if (rawQuery && nameL.includes(rawQuery)) {
          score += 100;
        } else if (rawQuery && textSearchSpace.includes(rawQuery)) {
          score += 40;
        }

        // Token match scoring
        searchTokens.forEach(token => {
          if (nameL.includes(token)) {
            score += 50;
          } else if (tagsL.some(t => t.includes(token))) {
            score += 30;
          } else if (trendL.includes(token)) {
            score += 20;
          } else if (textSearchSpace.includes(token)) {
            score += 10;
          }
        });

        // Category relevance bonus
        if (targetCategory && catL === targetCategory) {
          score += 15;
        }

        // Gender bonus / penalty
        if (targetGender) {
          if (p.gender.toLowerCase() === targetGender) {
            score += 15;
          } else if (p.gender === 'unisex') {
            score += 5;
          } else {
            score -= 20;
          }
        }

        // Regional match slight tie-breaker bonus
        if (p.region_relevance.some(r => r.toLowerCase() === state.toLowerCase())) {
          score += 5;
        }

        return { product: p, score };
      });

      // Filter products with positive score and sort descending by score
      const matched = scored.filter(item => item.score > 0).sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.product.local_purchase_count - a.product.local_purchase_count;
      });
      
      if (matched.length > 0) {
        list = matched.map(m => m.product);
      } else if (targetCategory) {
        // Fallback to category list if no specific item matches
        list = list.filter(p => p.category.toLowerCase() === targetCategory);
      }
    }

    // 2. Filter by Sidebar Selection
    if (selectedGender !== 'all') {
      list = list.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase() || p.gender === 'unisex');
    }

    if (selectedCategory !== 'all') {
      const sidebarTarget = normalizeCategoryName(selectedCategory);
      if (sidebarTarget) {
        list = list.filter(p => p.category.toLowerCase() === sidebarTarget);
      } else {
        list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
    }

    if (selectedBrand !== 'all') {
      list = list.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedOccasion !== 'all') {
      list = list.filter(p => p.occasion.toLowerCase() === selectedOccasion.toLowerCase());
    }

    if (priceRange !== 'all') {
      if (priceRange === 'under1000') list = list.filter(p => p.price < 1000);
      else if (priceRange === '1000-2500') list = list.filter(p => p.price >= 1000 && p.price <= 2500);
      else if (priceRange === '2500-5000') list = list.filter(p => p.price >= 2500 && p.price <= 5000);
      else if (priceRange === 'above5000') list = list.filter(p => p.price > 5000);
    }

    // 3. Location-aware Priority & Sorting Logic
    const stateMatches = list.filter(p => 
      p.region_relevance.some(r => r.toLowerCase() === state.toLowerCase())
    );
    const otherItems = list.filter(p => 
      !p.region_relevance.some(r => r.toLowerCase() === state.toLowerCase())
    );

    let finalOrderedList: typeof PRODUCTS = [];

    if (searchIntentResult?.intent && sortBy === 'regional') {
      // Keep AI search score relevance ordering when search query is active
      finalOrderedList = list;
    } else if (sortBy === 'regional') {
      stateMatches.sort((a, b) => b.local_purchase_count - a.local_purchase_count);
      otherItems.sort((a, b) => b.local_purchase_count - a.local_purchase_count);
      finalOrderedList = [...stateMatches, ...otherItems];
    } else if (sortBy === 'price-low') {
      finalOrderedList = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      finalOrderedList = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      finalOrderedList = [...list].sort((a, b) => b.local_purchase_count - a.local_purchase_count);
    } else {
      finalOrderedList = searchIntentResult?.intent ? list : [...stateMatches, ...otherItems];
    }

    return {
      displayProducts: finalOrderedList,
      stateMatchCount: stateMatches.length
    };
  }, [state, searchIntentResult, selectedGender, selectedCategory, selectedBrand, selectedOccasion, priceRange, sortBy]);

  const resetAllFilters = () => {
    setSelectedGender('all');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedOccasion('all');
    setPriceRange('all');
    setSortBy('regional');
    onClearSearch();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* Breadcrumb & Item Count Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 border-b border-gray-200 pb-3">
        <div>
          <span className="text-gray-400">Home / </span>
          <span className="font-semibold text-gray-800">
            {isBharatMode ? 'Regional Festive & Style Catalog' : 'Clothing & Fashion'}
          </span>
        </div>
        <div className="font-bold text-gray-900 text-sm">
          {isBharatMode ? 'Regional Style Edit - ' : 'Catalog - '}
          <span className="text-[#F13AB1]">{displayProducts.length} items</span>
        </div>
      </div>

      {/* AI Intent Breakdown Banner if search is active */}
      {searchIntentResult && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  AI Intent Parsed
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Query: "{searchIntentResult.rawQuery}"
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                {searchIntentResult.intent.category && (
                  <span className="bg-white border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Category: {searchIntentResult.intent.category}
                  </span>
                )}
                {searchIntentResult.intent.occasion && (
                  <span className="bg-white border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Occasion: {searchIntentResult.intent.occasion}
                  </span>
                )}
                {searchIntentResult.intent.gender && (
                  <span className="bg-white border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Gender: {searchIntentResult.intent.gender}
                  </span>
                )}
                {searchIntentResult.intent.price_range?.max && (
                  <span className="bg-white border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Price: Under ₹{searchIntentResult.intent.price_range.max}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClearSearch}
            className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-200 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            Clear AI Filter
          </button>
        </div>
      )}

      {/* Top Controls Bar (Filter Pills & Sort Dropdown) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        
        {/* Left: Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 mr-1">
            FILTERS
          </span>

          <button 
            onClick={() => setSelectedOccasion(selectedOccasion === 'festival' ? 'all' : 'festival')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              selectedOccasion === 'festival'
                ? 'bg-[#F13AB1] text-white border-[#F13AB1]'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Festive Wear
          </button>

          <button 
            onClick={() => setSelectedOccasion(selectedOccasion === 'wedding' ? 'all' : 'wedding')}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              selectedOccasion === 'wedding'
                ? 'bg-[#F13AB1] text-white border-[#F13AB1]'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wedding Collection
          </button>

          {(selectedGender !== 'all' || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedOccasion !== 'all' || priceRange !== 'all') && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-[#F13AB1] hover:underline px-2 py-0.5 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Right: Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg text-xs font-bold px-3 py-1.5 outline-none focus:border-[#F13AB1] cursor-pointer text-[#29303E]"
          >
            <option value="regional">
              {isBharatMode ? `Recommended (${state} Picks First)` : 'Recommended'}
            </option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating / Popularity</option>
          </select>
        </div>

      </div>

      {/* Main Grid Body (Left Sidebar + Right Product Grid) */}
      <div className="flex flex-col md:flex-row gap-6 mt-2">
        
        {/* LEFT FILTERS SIDEBAR */}
        <aside className="w-full md:w-60 lg:w-64 shrink-0 bg-white p-4 rounded-xl border border-gray-200/90 h-fit space-y-6 text-xs text-[#29303E]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="font-black uppercase tracking-wider text-sm text-[#29303E]">FILTERS</h3>
            <button 
              onClick={resetAllFilters}
              className="font-bold text-[#F13AB1] hover:underline text-[11px] cursor-pointer"
            >
              CLEAR ALL
            </button>
          </div>

          {/* Gender Filter */}
          <div className="border-b border-gray-200 pb-4 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">GENDER</h4>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Genders' },
                { id: 'men', label: 'Men' },
                { id: 'women', label: 'Women' },
                { id: 'kids', label: 'Boys & Girls' }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer hover:text-[#F13AB1] font-medium">
                  <input
                    type="radio"
                    name="gender"
                    checked={selectedGender === item.id}
                    onChange={() => setSelectedGender(item.id)}
                    className="accent-[#F13AB1] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="border-b border-gray-200 pb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">CATEGORIES</h4>
              <Search className="w-3.5 h-3.5 text-gray-400" />
            </div>
            
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Categories', count: PRODUCTS.length },
                { id: 'ethnic wear', label: 'Ethnic Wear / Kurtas', count: categoryCounts['Ethnic Wear'] },
                { id: 'western wear', label: 'Western Wear', count: categoryCounts['Western Wear'] },
                { id: 'footwear', label: 'Footwear & Juttis', count: categoryCounts['Footwear'] },
                { id: 'accessories', label: 'Jewelry & Accessories', count: categoryCounts['Accessories'] },
              ].map(cat => (
                <label key={cat.id} className="flex items-center justify-between cursor-pointer hover:text-[#F13AB1] font-medium">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                      className="accent-[#F13AB1] w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    <span className={selectedCategory === cat.id ? 'font-bold text-[#F13AB1]' : ''}>{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">({cat.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="border-b border-gray-200 pb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">BRAND</h4>
              <Search className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center justify-between cursor-pointer hover:text-[#F13AB1] font-medium">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrand === 'all'}
                    onChange={() => setSelectedBrand('all')}
                    className="accent-[#F13AB1] w-3.5 h-3.5 rounded cursor-pointer"
                  />
                  <span>All Brands</span>
                </div>
              </label>

              {brandsList.map(({ brand, count }) => (
                <label key={brand} className="flex items-center justify-between cursor-pointer hover:text-[#F13AB1] font-medium">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrand.toLowerCase() === brand.toLowerCase()}
                      onChange={() => setSelectedBrand(selectedBrand.toLowerCase() === brand.toLowerCase() ? 'all' : brand)}
                      className="accent-[#F13AB1] w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    <span className={selectedBrand.toLowerCase() === brand.toLowerCase() ? 'font-bold text-[#F13AB1]' : ''}>{brand}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">({count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-b border-gray-200 pb-4 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-gray-900 text-[11px]">PRICE</h4>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under1000', label: 'Under ₹1,000' },
                { id: '1000-2500', label: '₹1,000 to ₹2,500' },
                { id: '2500-5000', label: '₹2,500 to ₹5,000' },
                { id: 'above5000', label: 'Above ₹5,000' },
              ].map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:text-[#F13AB1] font-medium">
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === p.id}
                    onChange={() => setPriceRange(p.id)}
                    className="accent-[#F13AB1] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* RIGHT MAIN PRODUCT GRID */}
        <div className="flex-1 space-y-4">
          
          {/* Location personalization notice bar (Only shown in Bharat Mode) */}
          {isBharatMode && (
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-rose-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <MapPin className="w-4 h-4 text-[#F13AB1]" />
                <span>Personalized for {city}, {state}</span>
                <span className="text-[10px] font-extrabold bg-[#F13AB1] text-white px-2 py-0.5 rounded-full">
                  {stateMatchCount} Popular in {state} Top-Ranked
                </span>
              </div>

              <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                Full catalog accessible below
              </span>
            </div>
          )}

          {/* Grid Cards */}
          {displayProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#F13AB1] flex items-center justify-center font-bold">
                ✕
              </div>
              <h3 className="text-sm font-bold text-gray-800">No products match your selected filter criteria</h3>
              <p className="text-xs text-gray-500">Try loosening your brand or price filters to see products in our regional catalog.</p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 bg-[#F13AB1] text-white rounded-lg text-xs font-bold hover:brightness-105 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
