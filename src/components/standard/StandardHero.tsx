import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'handbags',
    brandLogo: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80',
    brandName: 'CAPRESE',
    title: 'HANDBAGS',
    discount: 'Min. 60% Off',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&auto=format&fit=crop&q=80',
    ctaText: '+ Explore',
    bgGradient: 'from-gray-50 via-slate-50 to-amber-50/40',
  },
  {
    id: 'ethnic',
    brandLogo: '',
    brandName: 'LIBAS & BIBA',
    title: 'DESIGNER ETHNIC WEAR',
    discount: '50-80% Off',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
    ctaText: '+ Shop Now',
    bgGradient: 'from-rose-50 via-orange-50 to-amber-50',
  },
  {
    id: 'western',
    brandLogo: '',
    brandName: 'MANGO & FOREVER 21',
    title: 'WESTERN DRESSES & TOPS',
    discount: '40-70% Off',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
    ctaText: '+ Discover',
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
  },
  {
    id: 'footwear',
    brandLogo: '',
    brandName: 'PUMA & NIKE',
    title: 'FOOTWEAR & SNEAKERS',
    discount: '40-80% Off',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
    ctaText: '+ View All',
    bgGradient: 'from-emerald-50 via-[#FFF8E7] to-amber-50',
  },
];

interface StandardHeroProps {
  onSelectSlide?: (title: string) => void;
}

export function StandardHero({ onSelectSlide }: StandardHeroProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 my-2 relative">
      <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-between bg-white group">
        
        {/* Background Subtle Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-colors duration-700`} />

        {/* Left Side: Product Image & Brand Tag */}
        <div 
          onClick={() => onSelectSlide?.(slide.title)}
          className="relative z-10 w-1/2 sm:w-3/5 h-full flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div className="relative w-full h-full max-h-[360px] flex items-center justify-center">
            {/* Brand Logo Watermark / Box */}
            {slide.brandName && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200/80 px-3 py-1.5 rounded-md shadow-2xs z-20">
                <span className="text-[11px] font-black tracking-widest text-teal-800 uppercase">
                  {slide.brandName}
                </span>
              </div>
            )}
            
            <img 
              src={slide.image} 
              alt={slide.title}
              className="max-h-full max-w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right Side: Headline & Offer details */}
        <div className="relative z-10 w-1/2 sm:w-2/5 h-full flex flex-col justify-center px-6 sm:px-12 pr-12 lg:pr-16 text-left">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-gray-900 font-extrabold mb-2 leading-tight">
            {slide.title}
          </h2>
          <p className="text-xl sm:text-3xl font-light text-gray-600 mb-6 tracking-wide">
            {slide.discount}
          </p>

          <div>
            <button 
              onClick={() => onSelectSlide?.(slide.title)}
              className="text-xs sm:text-sm font-extrabold text-gray-800 hover:text-[#F13AB1] tracking-widest uppercase py-1 border-b-2 border-gray-800 hover:border-[#F13AB1] transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              {slide.ctaText}
            </button>
          </div>
        </div>

        {/* Slide Indicators (Dots at bottom) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/60 shadow-2xs">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-[#29303E]' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Left & Right Arrow controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 border border-gray-200/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 border border-gray-200/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white shadow-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* Right Edge Fixed Side Flap Banner matching Screenshot 1 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center">
        <button className="bg-[#29303E] hover:bg-[#1f242f] text-white font-black text-[11px] tracking-widest px-2 py-4 rounded-l-xl shadow-xl flex items-center gap-2 group transition-all">
          <span className="[writing-mode:vertical-lr] rotate-180 uppercase">
            UPTO ₹300 OFF
          </span>
          <span className="w-2 h-2 bg-[#FD913C] rounded-full animate-ping"></span>
        </button>
      </div>
    </div>
  );
}
