import React from 'react';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { BharatBreadcrumbs } from './BharatBreadcrumbs';
import { NearbyFestivalsShowcase } from '../regional/NearbyFestivalsShowcase';
import { Sparkles, ArrowRight, TrendingUp, Calendar, Compass } from 'lucide-react';

interface CityExperiencePageProps {
  city: string;
  onNavigateHome: () => void;
  onNavigateTrends: (cityName: string) => void;
  onNavigateFestivals: (cityName: string) => void;
  onChangeCityClick: () => void;
}

const STATE_HERO_IMAGES: Record<string, string> = {
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
};

export function CityExperiencePage({
  city,
  onNavigateHome,
  onNavigateTrends,
  onNavigateFestivals,
  onChangeCityClick,
}: CityExperiencePageProps) {
  const { state, bannerData, isFetchingEditorial } = useCityTheme();
  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  const heroImage = STATE_HERO_IMAGES[state] || STATE_HERO_IMAGES['Bihar'];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-gray-950 text-white relative overflow-hidden">
      
      {/* Dark Variant Breadcrumbs */}
      <BharatBreadcrumbs 
        items={[{ label: `${city}, ${state}` }]} 
        onHomeClick={onNavigateHome}
        variant="dark"
      />

      {/* Main Full-Height Hero Container */}
      <div className="flex-1 relative w-full flex flex-col justify-between p-6 sm:p-10 max-w-[1600px] mx-auto z-10">
        
        {/* Background Image & Overlay Scrims */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt={`${city} ${state} Lifestyle`}
            className="w-full h-full object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          
          {/* Dynamic Color Accent Glow */}
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: accent.primary }}
          />
        </div>

        {/* Top Bar inside Hero: Location Tag & Change City button */}
        <div className="relative z-20 flex items-center justify-between gap-4 pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/60 border border-white/20 backdrop-blur-md text-amber-300">
            <Compass className="w-4 h-4 text-[#FD913C]" />
            <span>{city}, {state}</span>
          </div>

          <button
            onClick={onChangeCityClick}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-black rounded-full border border-white/30 backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            📍 Change City
          </button>
        </div>

        {/* Center Overlay Content */}
        <div className="relative z-20 max-w-3xl py-8 sm:py-12 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F13AB1] text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Bharat City Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
            {isFetchingEditorial ? (
              <span className="inline-block w-3/4 h-14 bg-white/20 animate-pulse rounded-2xl"></span>
            ) : (
              bannerData?.headline || `${city}'s Regional Festive Edit`
            )}
          </h1>

          <p className="text-base sm:text-xl text-gray-200 font-medium leading-relaxed max-w-2xl drop-shadow-md">
            {isFetchingEditorial ? (
              <span className="inline-block w-full h-12 bg-white/20 animate-pulse rounded-2xl"></span>
            ) : (
              bannerData?.subtext || `Curated festive silks, hand-embroidered ethnic wear, and local trends for ${city}, ${state}.`
            )}
          </p>
        </div>

        {/* Bottom Bar: Action Buttons & Swipe Right Indicator */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/15">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTrends(city)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-white text-gray-900 hover:bg-gray-100 active:scale-95 text-xs font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#F13AB1]" />
              <span>View City Trends</span>
            </button>

            <button
              onClick={() => onNavigateFestivals(city)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-[#F13AB1] hover:brightness-110 active:scale-95 text-white text-xs font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 fill-white" />
              <span>Browse Festivals</span>
            </button>
          </div>

          {/* Swipe Right Indicator */}
          <button 
            onClick={() => onNavigateFestivals(city)}
            className="group flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Swipe right to explore festivals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

      </div>

      {/* Automated Nearby Regional Festivals Showcase */}
      <div className="bg-gray-50 text-gray-900 py-6">
        <NearbyFestivalsShowcase />
      </div>
    </div>
  );
}
