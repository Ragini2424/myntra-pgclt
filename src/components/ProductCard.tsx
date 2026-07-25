import React from 'react';
import { Product } from '../types';
import { Star, MapPin, ShoppingBag } from 'lucide-react';
import { useCityTheme } from '../contexts/CityThemeContext';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  festiveMatchBadge?: {
    score: number;
    festivalName: string;
    reason?: string;
  };
}

export function ProductCard({ product, festiveMatchBadge }: ProductCardProps) {
  const { city, state } = useCityTheme();

  const isStateMatch = product.region_relevance?.some(
    r => r.toLowerCase() === state.toLowerCase()
  );

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Deterministic mock rating & review count for exact Myntra look
  const rating = product.rating || (4.2 + (parseInt(product.id.replace(/\D/g, '') || '5', 10) % 8) * 0.1).toFixed(1);
  const reviewCount = product.reviewCount || `${(1.2 + (parseInt(product.id.replace(/\D/g, '') || '3', 10) % 25) * 0.8).toFixed(1)}k`;
  const isAd = product.isAd || product.id.endsWith('01') || product.id.endsWith('07');

  // Dynamic local trending tag adaptation
  const trendingTagDisplay = product.local_trending_tag.includes('Patna') 
    ? product.local_trending_tag.replace(/Patna/g, city)
    : product.local_trending_tag;

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200/90 flex flex-col shadow-2xs group cursor-pointer hover:shadow-xl hover:border-[#F13AB1]/40 transition-all duration-300 relative overflow-hidden">
      
      {/* Festive Match Badge */}
      {festiveMatchBadge ? (
        <div className="absolute top-2.5 left-2.5 z-20 bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-emerald-500/40">
          <span>🎯 {festiveMatchBadge.score}% Match</span>
          <span className="hidden sm:inline">({festiveMatchBadge.festivalName})</span>
        </div>
      ) : isStateMatch ? (
        <div className="absolute top-2.5 left-2.5 z-20 bg-[#F13AB1] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          {state} Pick
        </div>
      ) : null}

      {/* AD Badge */}
      {isAd && (
        <div className="absolute top-2.5 right-2.5 z-20 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
          AD
        </div>
      )}

      {/* Product Image */}
      <div className="w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden relative group-hover:opacity-95 transition-opacity">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80';
          }}
        />
        
        {/* Myntra Star Rating Badge on image bottom-left */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-[#29303E] shadow-sm flex items-center gap-1">
          <span>{rating}</span>
          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
          <span className="text-gray-300 font-normal">|</span>
          <span className="text-gray-500 text-[10px] font-semibold">{reviewCount}</span>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="mt-2.5 flex flex-col flex-1">
        
        {/* Brand Name */}
        <div className="text-sm font-black text-[#29303E] tracking-tight line-clamp-1">
          {product.brand}
        </div>
        
        {/* Product Title */}
        <div className="text-xs font-medium text-gray-600 line-clamp-1 mt-0.5 group-hover:text-[#F13AB1] transition-colors">
          {product.name}
        </div>
        
        {/* Pricing line: Rs. Price, strikethrough MRP, discount % in Spicy Pink */}
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-black text-[#29303E]">
            Rs. {product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-gray-400 line-through font-normal">
            Rs. {product.mrp.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] font-bold text-[#F13AB1]">
            ({discountPercent}% OFF)
          </span>
        </div>

        {/* Local Purchase Count & Trending Tag */}
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1">
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FD913C] bg-orange-50 px-2 py-0.5 rounded self-start border border-orange-200/50">
            🔥 {trendingTagDisplay}
          </div>
          
          <div className="text-[10px] text-gray-500 flex items-center gap-1 font-medium mt-0.5">
            <ShoppingBag className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{product.local_purchase_count.toLocaleString('en-IN')} bought in {state}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

