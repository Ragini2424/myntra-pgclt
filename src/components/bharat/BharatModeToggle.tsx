import React from 'react';
import { Compass } from 'lucide-react';

interface BharatModeToggleProps {
  isBharatMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export function BharatModeToggle({ isBharatMode, onToggle }: BharatModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 hover:border-gray-300 px-3 py-1.5 rounded-full transition-all">
      <Compass className={`w-4 h-4 transition-colors ${isBharatMode ? 'text-[#F13AB1] animate-pulse' : 'text-gray-400'}`} />
      <span className="text-xs font-black text-[#29303E] tracking-tight hidden sm:inline select-none">
        Bharat Mode
      </span>
      
      {/* Switch Control */}
      <button
        type="button"
        role="switch"
        aria-checked={isBharatMode}
        onClick={() => onToggle(!isBharatMode)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F13AB1]/30 ${
          isBharatMode ? 'bg-[#F13AB1]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isBharatMode ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
