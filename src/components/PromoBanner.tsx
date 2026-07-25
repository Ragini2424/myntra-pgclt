import React from 'react';
import { Percent, Sparkles } from 'lucide-react';

export function PromoBanner() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-3">
      <div className="w-full bg-[#FFF8E7] border border-[#FDE68A] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        
        {/* Left Side: Offer Callout */}
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-[#FD913C]/15 flex items-center justify-center shrink-0 text-[#FD913C]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#FD913C] tracking-tight">
                Get 25% Off
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">
                Up To ₹200 Off*
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
              Valid on first order for regional festive collections & trending styles
            </p>
          </div>
        </div>

        {/* Center: Coupon Code Box */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white px-4 py-2 rounded-xl border border-dashed border-[#FD913C] shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">COUPON CODE</span>
            <span className="text-sm font-black text-[#29303E] tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              MYNTRASAVE
            </span>
          </div>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="text-[11px] font-semibold text-gray-600">
            On Your First Order | T&C Apply
          </span>
        </div>

        {/* Right Side: Decorative 3D % Tag */}
        <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F13AB1] to-purple-600 text-white shadow-md transform rotate-6 hover:rotate-0 transition-transform">
          <Percent className="w-7 h-7 stroke-[2.5]" />
        </div>

      </div>
    </div>
  );
}
