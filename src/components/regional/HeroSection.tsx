import React from 'react';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { Sparkles, Calendar, Compass, RefreshCw, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const STATE_BANNER_IMAGES: Record<string, string> = {
  'Bihar': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1600&auto=format&fit=crop&q=80',
  'Uttar Pradesh': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
  'West Bengal': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80',
  'Tamil Nadu': 'https://images.unsplash.com/photo-1610030469228-3e4b7b25bf3d?w=1600&auto=format&fit=crop&q=80',
  'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&auto=format&fit=crop&q=80',
  'Punjab': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1600&auto=format&fit=crop&q=80',
  'Rajasthan': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=80',
  'Gujarat': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1600&auto=format&fit=crop&q=80',
  'Maharashtra': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1600&auto=format&fit=crop&q=80',
  'Karnataka': 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1600&auto=format&fit=crop&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80',
  'Telangana': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1600&auto=format&fit=crop&q=80',
  'Assam': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80',
};

export function HeroSection() {
  const { 
    city, 
    state, 
    festivals, 
    bannerData, 
    editorialError,
    userDeviceDate,
    isFetchingEditorial,
    refreshEditorial 
  } = useCityTheme();

  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  // Resolve background banner image based on state or primary festival
  const primaryFestObj = festivals && festivals.length > 0 ? festivals[0] : null;
  const primaryFest = primaryFestObj ? primaryFestObj.name : '';
  
  let bannerImage = STATE_BANNER_IMAGES[state] || STATE_BANNER_IMAGES['Bihar'];

  if (primaryFest.toLowerCase().includes('durga') || primaryFest.toLowerCase().includes('saraswati')) {
    bannerImage = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80';
  } else if (primaryFest.toLowerCase().includes('chhath') || primaryFest.toLowerCase().includes('teej')) {
    bannerImage = 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1600&auto=format&fit=crop&q=80';
  } else if (primaryFest.toLowerCase().includes('pongal') || primaryFest.toLowerCase().includes('onam')) {
    bannerImage = 'https://images.unsplash.com/photo-1610030469228-3e4b7b25bf3d?w=1600&auto=format&fit=crop&q=80';
  } else if (primaryFest.toLowerCase().includes('diwali') || primaryFest.toLowerCase().includes('rakhi') || primaryFest.toLowerCase().includes('raksha')) {
    bannerImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80';
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 my-3">
      <div className="w-full relative min-h-[380px] lg:min-h-[420px] rounded-3xl flex items-center bg-gray-950 text-white overflow-hidden border border-gray-800 shadow-xl">
        
        {/* Dynamic Background Image */}
        <img 
          src={bannerImage}
          alt={`${state} Festival Traditional Background`}
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-1000 brightness-90"
        />

        {/* Gradient Scrims for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40 z-10" />

        {/* Dynamic State Accent Color Glow */}
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none z-10 transition-all duration-700"
          style={{ backgroundColor: accent.primary }}
        />

        {/* Hero Content Container */}
        <div className="w-full relative z-20 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-stretch justify-between">
          
          {/* Left Column: Location & Festive Headline */}
          <div className="flex-1 max-w-3xl flex flex-col justify-center">
            
            {/* Festival Badge / Chip (Spicy Pink or Spring Orange) */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FD913C] text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                {primaryFest ? `${primaryFest} Special` : `${state} Festive Edit`}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-gray-100 bg-black/50 border border-white/20 backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                {city}, {state}
              </span>

              {isFetchingEditorial && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300 animate-pulse bg-black/50 px-2.5 py-1 rounded-full border border-amber-400/30">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Fetching AI Editorial Copy...
                </span>
              )}
            </div>

            {/* Overlaid Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3 text-white drop-shadow-md">
              {isFetchingEditorial ? (
                <span className="inline-block w-3/4 h-12 bg-white/20 animate-pulse rounded-xl"></span>
              ) : (
                bannerData?.headline || `${city}'s Regional Festive Edit`
              )}
            </h1>

            {/* Overlaid Subtext */}
            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed max-w-2xl mb-6 drop-shadow-sm">
              {isFetchingEditorial ? (
                <span className="inline-block w-full h-12 bg-white/20 animate-pulse rounded-xl"></span>
              ) : (
                bannerData?.subtext || `Curated festive wear, silks, and footwear for celebrations in ${city}, ${state}.`
              )}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => refreshEditorial(city, state)}
                disabled={isFetchingEditorial}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F13AB1] hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingEditorial ? 'animate-spin' : ''}`} />
                Re-curate for {city}
              </button>
              
              <span className="text-[11px] text-gray-300 font-medium drop-shadow-xs">
                Device date: <strong className="text-amber-300">{userDeviceDate}</strong>
              </span>
            </div>
          </div>

          {/* Right Column: 60-Day Festival Radar Mini Card */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col justify-center">
            
            {/* 60-Day Festival Radar Card */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FD913C]" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Upcoming Festivals in {state}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    60-Day Window
                  </span>
                </div>

                {isFetchingEditorial ? (
                  <div className="space-y-2 py-1">
                    <div className="h-4 bg-white/10 animate-pulse rounded w-3/4"></div>
                    <div className="h-8 bg-white/10 animate-pulse rounded w-full"></div>
                  </div>
                ) : editorialError ? (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200">
                    <div className="flex items-center gap-1 font-bold text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> Quota Notice
                    </div>
                    <p className="text-[10px] mt-0.5 leading-snug">{editorialError}</p>
                  </div>
                ) : festivals && festivals.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {festivals.slice(0, 3).map((fest, idx) => (
                      <div key={idx} className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-amber-300">
                          <span>🎉 {fest.name}</span>
                          <span className="text-[9px] text-gray-300 font-semibold">{fest.dateRange}</span>
                        </div>
                        <p className="text-[10px] text-gray-200 line-clamp-2">{fest.culturalNote}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-300">Curating upcoming festive events for {state}...</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
