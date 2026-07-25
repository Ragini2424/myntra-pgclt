import React, { useRef } from 'react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../ProductCard';
import { ChevronLeft, ChevronRight, Sparkles, HeartHandshake, Briefcase, Sun } from 'lucide-react';

interface OccasionShelfProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeBg: string;
  occasionKey: 'wedding' | 'casual' | 'work' | 'festival';
}

function OccasionShelfItem({ title, subtitle, icon, badge, badgeBg, occasionKey }: OccasionShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = PRODUCTS.filter(p => p.occasion === occasionKey).slice(0, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${badgeBg}`}>
              {badge}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#29303E] tracking-tight flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center shadow-2xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center shadow-2xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Shelf */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-1"
      >
        {items.map(product => (
          <div key={product.id} className="snap-start min-w-[230px] sm:min-w-[260px] max-w-[260px] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OccasionShelves() {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 space-y-6 mt-8 mb-12">
      <OccasionShelfItem 
        title="Wedding & Celebration Royal Edit"
        subtitle="Embroidered sherwanis, silk lehengas, and zardozi drapes for upcoming bridal seasons."
        icon={<HeartHandshake className="w-5 h-5 text-[#F13AB1]" />}
        badge="Shaadi Season"
        badgeBg="bg-[#F13AB1]"
        occasionKey="wedding"
      />

      <OccasionShelfItem 
        title="Office & Professional Smart Wear"
        subtitle="Wrinkle-free shirts, tailored trousers, and linen Nehru jackets for executive flair."
        icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
        badge="Workplace Chic"
        badgeBg="bg-indigo-600"
        occasionKey="work"
      />

      <OccasionShelfItem 
        title="Daily Comfort & Casual Essentials"
        subtitle="Breathable printed cotton kurtas, lightweight tees, and relaxed footwear."
        icon={<Sun className="w-5 h-5 text-[#FD913C]" />}
        badge="Everyday Style"
        badgeBg="bg-[#FD913C]"
        occasionKey="casual"
      />
    </section>
  );
}
