import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromoBanner } from './components/PromoBanner';
import { HeroSection } from './components/regional/HeroSection';
import { FestiveShelf } from './components/regional/FestiveShelf';
import { ProductGrid } from './components/ProductGrid';
import { OccasionShelves } from './components/regional/OccasionShelves';
import { useCityTheme } from './contexts/CityThemeContext';
import { SearchIntent } from './types';
import { MapPin, Sparkles, Heart } from 'lucide-react';

import { StandardHero } from './components/standard/StandardHero';
import { ShopByCategory } from './components/standard/ShopByCategory';

// Bharat Mode Sub-Pages
import { BharatCityModal } from './components/bharat/BharatCityModal';
import { CityExperiencePage } from './components/bharat/CityExperiencePage';
import { FestivalCarouselPage } from './components/bharat/FestivalCarouselPage';
import { FestivePicksPage } from './components/bharat/FestivePicksPage';
import { CityTrendsPage } from './components/bharat/CityTrendsPage';
import { NearbyFestivalsShowcase } from './components/regional/NearbyFestivalsShowcase';

type RouteState =
  | { type: 'home' }
  | { type: 'city'; city: string }
  | { type: 'festivals'; city: string }
  | { type: 'festive_picks'; festivalName: string; state: string }
  | { type: 'city_trends'; city: string };

function parsePath(pathname: string): RouteState {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'bharat') {
    if (parts[1] === 'city' && parts[2]) {
      const city = decodeURIComponent(parts[2]);
      if (parts[3] === 'trends') {
        return { type: 'city_trends', city };
      }
      if (parts[3] === 'festivals') {
        return { type: 'festivals', city };
      }
      return { type: 'city', city };
    }
    if (parts[1] === 'festival' && parts[2] && parts[3]) {
      const festivalName = decodeURIComponent(parts[2]);
      const state = decodeURIComponent(parts[3]);
      return { type: 'festive_picks', festivalName, state };
    }
  }
  return { type: 'home' };
}

function buildPath(route: RouteState): string {
  switch (route.type) {
    case 'city':
      return `/bharat/city/${encodeURIComponent(route.city)}`;
    case 'festivals':
      return `/bharat/city/${encodeURIComponent(route.city)}/festivals`;
    case 'festive_picks':
      return `/bharat/festival/${encodeURIComponent(route.festivalName)}/${encodeURIComponent(route.state)}`;
    case 'city_trends':
      return `/bharat/city/${encodeURIComponent(route.city)}/trends`;
    case 'home':
    default:
      return '/';
  }
}

export default function App() {
  const { city, state, setCityInput } = useCityTheme();

  // 1. Requirement 1: Store Bharat Mode preference in localStorage (Default: OFF)
  const [isBharatMode, setIsBharatMode] = useState<boolean>(() => {
    return localStorage.getItem('bharat_mode_enabled') === 'true';
  });

  // Modal State for City Selection
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);

  // Router State synced with window.location
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname));

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper to push new route to history
  const navigateTo = (newRoute: RouteState) => {
    const path = buildPath(newRoute);
    window.history.pushState({}, '', path);
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Bharat Mode handler
  const handleToggleBharatMode = (enabled: boolean) => {
    setIsBharatMode(enabled);
    localStorage.setItem('bharat_mode_enabled', String(enabled));

    if (!enabled) {
      // Return to home when Bharat Mode is turned OFF
      setIsCityModalOpen(false);
      navigateTo({ type: 'home' });
    }
  };

  // City modal submit handler
  const handleSelectCityFromModal = async (cityName: string) => {
    await setCityInput(cityName);
    // Requirement 3: Navigate to new page: /bharat/city/{city-name}
    navigateTo({ type: 'city', city: cityName });
  };

  // Selected Category / Active Catalog View state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search intent state
  const [searchIntentResult, setSearchIntentResult] = useState<{
    intent: SearchIntent;
    rawQuery: string;
  } | null>(null);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearchIntent = (result: { intent: SearchIntent; rawQuery: string } | null) => {
    setIsSearching(true);
    setSearchIntentResult(result);
    if (result) {
      setSelectedCategory(result.rawQuery);
      if (route.type !== 'home') {
        navigateTo({ type: 'home' });
      }
      setTimeout(() => {
        const gridEl = document.getElementById('product-grid-main');
        if (gridEl) {
          gridEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setSelectedCategory(null);
    }
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleSelectCategory = (catName: string) => {
    if (catName.toLowerCase() === 'home') {
      setSelectedCategory(null);
      setSearchIntentResult(null);
      return;
    }
    setSelectedCategory(catName);
    setSearchIntentResult({
      intent: { category: catName, occasion: '', priceRange: '', searchQuery: catName },
      rawQuery: catName,
    });
    if (route.type !== 'home') {
      navigateTo({ type: 'home' });
    }
    setTimeout(() => {
      const gridEl = document.getElementById('product-grid-main');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Requirement 8: Logo click always returns to homepage
  const handleLogoClick = () => {
    setSelectedCategory(null);
    setSearchIntentResult(null);
    navigateTo({ type: 'home' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/60 text-gray-900 selection:bg-[#F13AB1] selection:text-white">
      
      {/* Sticky Navigation Header */}
      <Navbar 
        onSearchIntent={handleSearchIntent}
        activeSearchQuery={searchIntentResult?.rawQuery || null}
        isSearching={isSearching}
        isBharatMode={isBharatMode}
        onToggleBharatMode={handleToggleBharatMode}
        onLogoClick={handleLogoClick}
        onCategoryClick={handleSelectCategory}
        city={city}
        onChangeCityClick={() => setIsCityModalOpen(true)}
      />

      {/* Requirement 3: City Selection Modal when Bharat Mode is toggled ON */}
      <BharatCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectCity={handleSelectCityFromModal}
        initialCity={city}
      />

      {/* MAIN VIEW SWITCHER */}
      {isBharatMode && route.type === 'city' && (
        /* 4. CITY EXPERIENCE PAGE */
        <CityExperiencePage
          city={route.city || city}
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onNavigateTrends={(c) => navigateTo({ type: 'city_trends', city: c })}
          onNavigateFestivals={(c) => navigateTo({ type: 'festivals', city: c })}
          onChangeCityClick={() => setIsCityModalOpen(true)}
        />
      )}

      {isBharatMode && route.type === 'festivals' && (
        /* 5. FESTIVAL CAROUSEL PAGE */
        <FestivalCarouselPage
          city={route.city || city}
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onNavigateCity={(c) => navigateTo({ type: 'city', city: c })}
          onNavigateFestivePicks={(fest, st) => navigateTo({ type: 'festive_picks', festivalName: fest, state: st })}
        />
      )}

      {isBharatMode && route.type === 'festive_picks' && (
        /* 6. FESTIVE PICKS CATALOG PAGE */
        <FestivePicksPage
          festivalName={route.festivalName}
          state={route.state || state}
          city={city}
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onNavigateCity={(c) => navigateTo({ type: 'city', city: c })}
          onNavigateFestivals={(c) => navigateTo({ type: 'festivals', city: c })}
        />
      )}

      {isBharatMode && route.type === 'city_trends' && (
        /* 7. CITY TRENDS CATALOG PAGE */
        <CityTrendsPage
          city={route.city || city}
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onNavigateCity={(c) => navigateTo({ type: 'city', city: c })}
        />
      )}

      {/* Standard Myntra Homepage when Bharat Mode is OFF */}
      {!isBharatMode && (
        <>
          {(selectedCategory || searchIntentResult) ? (
            /* Catalog view opens when clicking hero banner, category card, or searching */
            <>
              <PromoBanner />
              <main id="product-grid-main" className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchIntentResult(null);
                    }}
                    className="text-xs font-black text-[#29303E] hover:text-[#F13AB1] flex items-center gap-2 transition-all cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs hover:border-[#F13AB1]"
                  >
                    ← Return to Homepage
                  </button>
                  <div className="text-sm font-extrabold text-[#29303E]">
                    Showing Catalog for: <span className="text-[#F13AB1] uppercase">{selectedCategory || searchIntentResult?.rawQuery}</span>
                  </div>
                </div>

                <ProductGrid 
                  searchIntentResult={searchIntentResult}
                  onClearSearch={() => {
                    setSearchIntentResult(null);
                    setSelectedCategory(null);
                  }}
                  isBharatMode={false}
                />
              </main>
            </>
          ) : (
            /* Standard Homepage - Banner, Hero, Shop By Category ONLY (no catalogue) */
            <>
              <PromoBanner />
              <StandardHero onSelectSlide={handleSelectCategory} />
              <ShopByCategory onSelectCategory={handleSelectCategory} />
            </>
          )}
        </>
      )}

      {/* Bharat Mode Regional Homepage when Bharat Mode is ON and at route home */}
      {isBharatMode && route.type === 'home' && (
        <>
          <PromoBanner />
          {searchIntentResult ? (
            /* When Search Query is active in Bharat Mode, show Search Results immediately at top */
            <main id="product-grid-main" className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full">
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F13AB1] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Search Results</div>
                    <div className="text-sm font-extrabold text-[#29303E]">
                      Showing matching items for: <span className="text-[#F13AB1]">"{searchIntentResult.rawQuery}"</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSearchIntentResult(null);
                    setSelectedCategory(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Clear Search
                </button>
              </div>

              <ProductGrid 
                searchIntentResult={searchIntentResult}
                onClearSearch={() => setSearchIntentResult(null)}
                isBharatMode={true}
              />
            </main>
          ) : (
            /* Default Bharat Mode Home Shelves */
            <>
              <HeroSection />
              <FestiveShelf />
              <NearbyFestivalsShowcase />

              <main id="product-grid-main" className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full">
                <ProductGrid 
                  searchIntentResult={null}
                  onClearSearch={() => setSearchIntentResult(null)}
                  isBharatMode={true}
                />
              </main>

              <OccasionShelves />
            </>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="bg-[#29303E] text-white py-10 px-4 sm:px-8 border-t border-gray-700 mt-12">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-medium text-gray-300">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-500"></div>
            <span className="text-gray-300 font-semibold flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F13AB1]" />
              Made with 🤍 by Tiddi N Noorie
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1 text-center sm:text-right">
            <div className="text-[12px] font-black tracking-wider text-[#F13AB1] bg-pink-950/40 border border-pink-500/30 px-3 py-1 rounded-full mt-1 flex items-center gap-1">
              <span>#PrettyGirlsCodeLikeThis</span> ✨
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
