import React, { useState, useRef } from 'react';
import { useCityTheme, STATE_ACCENTS } from '../../contexts/CityThemeContext';
import { BharatBreadcrumbs } from './BharatBreadcrumbs';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface FestivalCarouselPageProps {
  city: string;
  onNavigateHome: () => void;
  onNavigateCity: (cityName: string) => void;
  onNavigateFestivePicks: (festivalName: string, stateName: string) => void;
}

const FESTIVAL_IMAGES: Record<string, string> = {
  'Chhath': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1600&auto=format&fit=crop&q=80',
  'Teej': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
  'Durga': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&auto=format&fit=crop&q=80',
  'Onam': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&auto=format&fit=crop&q=80',
  'Pongal': 'https://images.unsplash.com/photo-1610030469228-3e4b7b25bf3d?w=1600&auto=format&fit=crop&q=80',
  'Ganesh': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1600&auto=format&fit=crop&q=80',
  'Diwali': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
  'Raksha': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1600&auto=format&fit=crop&q=80',
};

export function FestivalCarouselPage({
  city,
  onNavigateHome,
  onNavigateCity,
  onNavigateFestivePicks,
}: FestivalCarouselPageProps) {
  const { state, festivals } = useCityTheme();
  const accent = STATE_ACCENTS[state] || STATE_ACCENTS['Bihar'];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback 5-8 festivals if state festivals array is short
  const fallbackFestivals = [
    {
      name: `${state} Grand Festive Season`,
      dateRange: 'August 15 - September 30',
      culturalNote: `Vibrant traditional silk drapes, embroidered kurtas, and festive footwear for celebrations across ${state}.`
    },
    {
      name: 'Autumn Puja & Sangeet Celebrations',
      dateRange: 'September 10 - October 15',
      culturalNote: `Opulent silk sarees and tailored ethnic ensembles curated for ${city}'s grand festive season.`
    },
    {
      name: 'Diwali & Festival of Lights',
      dateRange: 'October 20 - November 10',
      culturalNote: `Sparkling zari drapes, royal bandhgalas, and auspicious festival footwear.`
    },
    {
      name: 'Winter Wedding & Royal Sangeet',
      dateRange: 'November 15 - December 25',
      culturalNote: `Heavy zardozi lehengas, silk sherwanis, and handcrafted velvet mojaris.`
    },
    {
      name: 'Spring Heritage & Temple Utsav',
      dateRange: 'January 10 - February 28',
      culturalNote: `Handwoven cotton-silk attire and traditional festival jewelry for ${city}.`
    }
  ];

  const activeFestivals = festivals && festivals.length >= 2 ? festivals : fallbackFestivals;

  const currentFest = activeFestivals[currentIndex] || activeFestivals[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeFestivals.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeFestivals.length) % activeFestivals.length);
  };

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX > 50) {
      handlePrev();
    } else if (diffX < -50) {
      handleNext();
    }
    touchStartX.current = null;
  };

  // Background image resolution
  let festImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80';
  for (const [key, imgUrl] of Object.entries(FESTIVAL_IMAGES)) {
    if (currentFest.name.toLowerCase().includes(key.toLowerCase())) {
      festImage = imgUrl;
      break;
    }
  }

  return (
    <div 
      className="min-h-[calc(100vh-80px)] flex flex-col bg-gray-950 text-white relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dark Variant Breadcrumbs */}
      <BharatBreadcrumbs 
        items={[
          { label: `${city}, ${state}`, onClick: () => onNavigateCity(city) },
          { label: 'Festivals' }
        ]} 
        onHomeClick={onNavigateHome}
        variant="dark"
      />

      {/* Main Full-Height Slide */}
      <div className="flex-1 relative w-full flex flex-col justify-between p-6 sm:p-10 max-w-[1600px] mx-auto z-10">
        
        {/* Background Image & Overlay Scrims */}
        <div className="absolute inset-0 z-0 transition-all duration-700">
          <img 
            src={festImage} 
            alt={currentFest.name}
            className="w-full h-full object-cover object-center brightness-70 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          
          <div 
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: accent.primary }}
          />
        </div>

        {/* Top Header inside Carousel */}
        <div className="relative z-20 flex items-center justify-between gap-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FD913C] text-white shadow-md">
            <Calendar className="w-4 h-4 fill-white" />
            <span>{currentFest.dateRange}</span>
          </div>

          <div className="text-xs font-black bg-black/60 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
            Festival {currentIndex + 1} of {activeFestivals.length}
          </div>
        </div>

        {/* Navigation Arrow Overlay Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl cursor-pointer"
          aria-label="Previous festival"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl cursor-pointer"
          aria-label="Next festival"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center Content Box */}
        <div className="relative z-20 max-w-3xl my-auto py-10 space-y-4 px-4 sm:px-8">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F13AB1] text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{state} Festival Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
            {currentFest.name}
          </h1>

          <p className="text-base sm:text-lg text-gray-200 font-medium leading-relaxed max-w-2xl drop-shadow-md">
            {currentFest.culturalNote}
          </p>
        </div>

        {/* Bottom Bar: Action Buttons & Carousel Dots */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/15">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigateFestivePicks(currentFest.name, state)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-[#F13AB1] hover:brightness-110 active:scale-95 text-white text-xs font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>View Festive Picks</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateCity(city)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {city}</span>
            </button>
          </div>

          {/* Carousel Dots Indicator */}
          <div className="flex items-center gap-2">
            {activeFestivals.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex 
                    ? 'w-8 bg-[#F13AB1]' 
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
