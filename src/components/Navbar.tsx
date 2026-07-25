import React from 'react';
import { SearchBar } from './SearchBar';
import { SearchIntent } from '../types';
import { User, Heart, ShoppingBag, MapPin } from 'lucide-react';
import { BharatModeToggle } from './bharat/BharatModeToggle';

interface NavbarProps {
  onSearchIntent: (result: { intent: SearchIntent; rawQuery: string } | null) => void;
  activeSearchQuery: string | null;
  isSearching: boolean;
  isBharatMode: boolean;
  onToggleBharatMode: (enabled: boolean) => void;
  onLogoClick: () => void;
  onCategoryClick?: (category: string) => void;
  city?: string;
  onChangeCityClick?: () => void;
}

export function Navbar({
  onSearchIntent,
  activeSearchQuery,
  isSearching,
  isBharatMode,
  onToggleBharatMode,
  onLogoClick,
  onCategoryClick,
  city,
  onChangeCityClick,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-2xs transition-all w-full overflow-visible">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* TOP ROW: Logo + Category Nav + Action Icons */}
        <div className="px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 border-b border-gray-100">
          
          {/* Logo & Category Navigation */}
          <div className="flex items-center gap-4 lg:gap-8 min-w-0">
            {/* Myntra M Logo */}
            <div 
              onClick={onLogoClick}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              title="Return to Myntra Homepage"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#F13AB1] via-[#FD913C] to-[#E72744] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <span className="text-white font-black text-xl sm:text-2xl italic tracking-tighter">M</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base sm:text-lg text-[#29303E] tracking-tight">MYNTRA</span>
                  {isBharatMode && (
                    <span className="bg-[#FD913C] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-widest animate-fade-in">
                      BHARAT
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-400 hidden sm:inline">
                  {isBharatMode ? 'Hyper-Local Experience' : 'Online Fashion Store'}
                </span>
              </div>
            </div>

            {/* Nav Categories */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-black tracking-wider text-[#29303E]">
              <button onClick={() => onCategoryClick ? onCategoryClick('Men') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">MEN</button>
              <button onClick={() => onCategoryClick ? onCategoryClick('Women') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">WOMEN</button>
              <button onClick={() => onCategoryClick ? onCategoryClick('Kids') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">KIDS</button>
              <button onClick={() => onCategoryClick ? onCategoryClick('Home') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">HOME</button>
              <button onClick={() => onCategoryClick ? onCategoryClick('Beauty') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">BEAUTY</button>
              <button onClick={() => onCategoryClick ? onCategoryClick('Genz') : onLogoClick()} className="hover:text-[#F13AB1] transition-colors uppercase py-1 cursor-pointer whitespace-nowrap">GENZ</button>
            </nav>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-5 text-gray-700 shrink-0">
            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#F13AB1] transition-colors group">
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold hidden sm:inline">Profile</span>
            </div>

            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#F13AB1] transition-colors group">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold hidden sm:inline">Wishlist</span>
            </div>

            <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#F13AB1] transition-colors group relative">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold hidden sm:inline">Bag</span>
              <span className="absolute -top-1 -right-1 bg-[#F13AB1] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </div>
          </div>

        </div>

        {/* SECOND ROW: Search Bar + Location Badge & Bharat Mode Toggle */}
        <div className="px-4 sm:px-8 py-2 bg-gray-50/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="flex-1 w-full sm:w-auto min-w-0">
            <SearchBar 
              onSearchIntent={onSearchIntent}
              activeSearchQuery={activeSearchQuery}
              isLoading={isSearching}
              isBharatMode={isBharatMode}
            />
          </div>

          {/* Location Badge & Bharat Mode Toggle */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            
            {/* Active City Location Badge */}
            {isBharatMode && city && (
              <button
                onClick={onChangeCityClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-[#29303E] border border-[#FD913C]/40 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Click to change city"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FD913C] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[80px] sm:max-w-[120px] font-black text-[#29303E]">{city}</span>
                <span className="text-[10px] text-[#FD913C] font-extrabold uppercase bg-white px-1.5 py-0.5 rounded-md border border-[#FD913C]/30 shadow-2xs">Change</span>
              </button>
            )}

            {/* BHARAT MODE TOGGLE */}
            <div className="shrink-0">
              <BharatModeToggle 
                isBharatMode={isBharatMode}
                onToggle={onToggleBharatMode}
              />
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}

