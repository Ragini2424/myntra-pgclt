import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BharatBreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick: () => void;
  variant?: 'light' | 'dark';
}

export function BharatBreadcrumbs({ items, onHomeClick, variant = 'light' }: BharatBreadcrumbsProps) {
  const isDark = variant === 'dark';

  return (
    <nav className={`flex items-center gap-1.5 text-xs font-semibold py-2.5 px-4 sm:px-8 border-b transition-colors z-30 ${
      isDark 
        ? 'bg-black/60 backdrop-blur-md border-white/10 text-gray-300' 
        : 'bg-white/90 backdrop-blur-md border-gray-200/80 text-gray-500'
    }`}>
      <button 
        onClick={onHomeClick}
        className={`flex items-center gap-1 transition-colors font-bold cursor-pointer ${
          isDark ? 'text-gray-200 hover:text-amber-300' : 'text-gray-700 hover:text-[#F13AB1]'
        }`}
      >
        <Home className="w-3.5 h-3.5 text-[#FD913C]" />
        <span>Bharat</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            {isLast || !item.onClick ? (
              <span className={`font-bold truncate max-w-[200px] sm:max-w-xs ${
                isDark ? 'text-white' : 'text-[#29303E]'
              }`}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className={`transition-colors font-medium truncate max-w-[150px] sm:max-w-xs cursor-pointer ${
                  isDark ? 'text-gray-300 hover:text-amber-300' : 'text-gray-600 hover:text-[#F13AB1]'
                }`}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
